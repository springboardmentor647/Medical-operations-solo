import pandas as pd
from sqlalchemy.orm import Session
from .. import database

class AnalyticsEngine:
    @staticmethod
    def get_geographic_distribution(db: Session):
        patients = db.query(database.Patient).all()
        df = pd.DataFrame([p.__dict__ for p in patients])
        if df.empty: return []
        distribution = df.groupby('state').size().reset_index(name='count')
        return distribution.to_dict(orient='records')