from app.schemas.base import CamelModel


class MonthlyAmountOut(CamelModel):
    month: str
    amount: float


class MonthlyCountOut(CamelModel):
    month: str
    count: int
