from datetime import datetime
from sqlalchemy.orm import Session
from .. import database

class EventLogger:
    @staticmethod
    def record(db: Session, event_type: str, entity_name: str, entity_id: str, description: str):
        event = database.OperationalEvent(
            event_type=event_type,
            entity_name=entity_name,
            entity_id=str(entity_id),
            timestamp=datetime.now(),
            description=description
        )
        db.add(event)