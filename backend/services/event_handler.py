from datetime import datetime
from sqlalchemy.orm import Session
from .. import database

class EventLogger:
    @staticmethod
    def log(db: Session, event_type: str, entity_id: str, description: str):
        event = database.OperationalEvent(
            event_type=event_type,
            entity_id=str(entity_id),
            timestamp=datetime.now(),
            description=description
        )
        db.add(event)
        db.commit()