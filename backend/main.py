from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import uuid
from datetime import datetime, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext

app = FastAPI(title="VelocityBank API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security
SECRET_KEY = "your-secret-key-here"
ALGORITHM = "HS256"
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# In-memory storage (replace with database in production)
users_db = {}
accounts_db = {}
transactions_db = {}

# Pydantic models
class UserCreate(BaseModel):
    email: str
    password: str
    full_name: str
    phone: str

class UserLogin(BaseModel):
    email: str
    password: str

class User(BaseModel):
    id: str
    email: str
    full_name: str
    phone: str
    created_at: datetime

class Account(BaseModel):
    id: str
    user_id: str
    account_number: str
    balance: float
    account_type: str
    created_at: datetime

class Transaction(BaseModel):
    id: str
    account_id: str
    amount: float
    transaction_type: str
    description: str
    created_at: datetime

class TransactionCreate(BaseModel):
    account_id: str
    amount: float
    transaction_type: str
    description: str

class TransferRequest(BaseModel):
    from_account: str
    to_account: str
    amount: float
    description: str

# Helper functions
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(hours=24)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def generate_account_number():
    return f"VB{str(uuid.uuid4().int)[:10]}"

# Routes
@app.post("/api/register")
async def register(user: UserCreate):
    if user.email in users_db:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user_id = str(uuid.uuid4())
    hashed_password = get_password_hash(user.password)
    
    # Create user
    users_db[user.email] = {
        "id": user_id,
        "email": user.email,
        "password": hashed_password,
        "full_name": user.full_name,
        "phone": user.phone,
        "created_at": datetime.now()
    }
    
    # Create default checking account
    account_id = str(uuid.uuid4())
    account_number = generate_account_number()
    accounts_db[account_id] = {
        "id": account_id,
        "user_id": user_id,
        "account_number": account_number,
        "balance": 1000.0,  # Welcome bonus
        "account_type": "checking",
        "created_at": datetime.now()
    }
    
    # Create welcome transaction
    transaction_id = str(uuid.uuid4())
    transactions_db[transaction_id] = {
        "id": transaction_id,
        "account_id": account_id,
        "amount": 1000.0,
        "transaction_type": "credit",
        "description": "Welcome bonus",
        "created_at": datetime.now()
    }
    
    token = create_access_token(data={"sub": user.email})
    return {"token": token, "user_id": user_id}

@app.post("/api/login")
async def login(user: UserLogin):
    if user.email not in users_db:
        raise HTTPException(status_code=400, detail="Invalid credentials")
    
    stored_user = users_db[user.email]
    if not verify_password(user.password, stored_user["password"]):
        raise HTTPException(status_code=400, detail="Invalid credentials")
    
    token = create_access_token(data={"sub": user.email})
    return {"token": token, "user_id": stored_user["id"]}

@app.get("/api/profile")
async def get_profile(email: str):
    if email not in users_db:
        raise HTTPException(status_code=404, detail="User not found")
    
    user = users_db[email]
    return {
        "id": user["id"],
        "email": user["email"],
        "full_name": user["full_name"],
        "phone": user["phone"],
        "created_at": user["created_at"]
    }

@app.get("/api/accounts/{user_id}")
async def get_accounts(user_id: str):
    user_accounts = []
    for account in accounts_db.values():
        if account["user_id"] == user_id:
            user_accounts.append(account)
    return user_accounts

@app.get("/api/transactions/{account_id}")
async def get_transactions(account_id: str):
    account_transactions = []
    for transaction in transactions_db.values():
        if transaction["account_id"] == account_id:
            account_transactions.append(transaction)
    return sorted(account_transactions, key=lambda x: x["created_at"], reverse=True)

@app.post("/api/transfer")
async def transfer_money(transfer: TransferRequest):
    # Validate accounts exist
    from_account = None
    to_account = None
    
    for account in accounts_db.values():
        if account["account_number"] == transfer.from_account:
            from_account = account
        if account["account_number"] == transfer.to_account:
            to_account = account
    
    if not from_account or not to_account:
        raise HTTPException(status_code=404, detail="Account not found")
    
    if from_account["balance"] < transfer.amount:
        raise HTTPException(status_code=400, detail="Insufficient funds")
    
    # Process transfer
    accounts_db[from_account["id"]]["balance"] -= transfer.amount
    accounts_db[to_account["id"]]["balance"] += transfer.amount
    
    # Create transactions
    debit_transaction = {
        "id": str(uuid.uuid4()),
        "account_id": from_account["id"],
        "amount": -transfer.amount,
        "transaction_type": "debit",
        "description": f"Transfer to {transfer.to_account}: {transfer.description}",
        "created_at": datetime.now()
    }
    
    credit_transaction = {
        "id": str(uuid.uuid4()),
        "account_id": to_account["id"],
        "amount": transfer.amount,
        "transaction_type": "credit",
        "description": f"Transfer from {transfer.from_account}: {transfer.description}",
        "created_at": datetime.now()
    }
    
    transactions_db[debit_transaction["id"]] = debit_transaction
    transactions_db[credit_transaction["id"]] = credit_transaction
    
    return {"message": "Transfer successful"}

@app.get("/api/dashboard/{user_id}")
async def get_dashboard(user_id: str):
    # Get user accounts
    user_accounts = []
    total_balance = 0
    
    for account in accounts_db.values():
        if account["user_id"] == user_id:
            user_accounts.append(account)
            total_balance += account["balance"]
    
    # Get recent transactions
    recent_transactions = []
    for account in user_accounts:
        for transaction in transactions_db.values():
            if transaction["account_id"] == account["id"]:
                recent_transactions.append(transaction)
    
    recent_transactions = sorted(recent_transactions, key=lambda x: x["created_at"], reverse=True)[:5]
    
    return {
        "total_balance": total_balance,
        "accounts": user_accounts,
        "recent_transactions": recent_transactions
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)