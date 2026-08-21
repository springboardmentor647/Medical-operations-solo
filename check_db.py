import sqlite3
db_path = r"D:\INTERNSHIP\7TH SEM\INFOSYS SPRINGBOARD\APP\data\hospital_blueprint.db"
conn = sqlite3.connect(db_path)
count = conn.execute("SELECT count(*) FROM rooms").fetchone()[0]
print(f"Rooms in DB: {count}")
conn.close()