# app/scripts/init_exercises.py
# 這個腳本用來初始化 BodyPart 和 Exercise 的資料，確保我們有一些預設的訓練分類和動作可以使用
# 執行方式：在 terminal 中 cd 到 backend/app 目錄，然後執行 python -m app.scripts.init_exercises.py
from app.database import SessionLocal
from app.models import BodyPart, Exercise

db = SessionLocal()

# 1️⃣ 初始化 BodyPart
body_parts = [
    {"id": 1, "name": "胸"},
    {"id": 2, "name": "腿"},
    {"id": 3, "name": "背"},
    {"id": 4, "name": "肩"},
    {"id": 5, "name": "二頭"},
    {"id": 6, "name": "三頭"},
    {"id": 7, "name": "核心"},
]

for bp in body_parts:
    if not db.query(BodyPart).filter(BodyPart.id == bp["id"]).first():
        db.add(BodyPart(id=bp["id"], name=bp["name"]))

db.commit()
print("Body parts inserted!")

# 2️⃣ 初始化 Exercises
exerciseData = {
    1: ["槓鈴臥推", "上斜啞鈴推舉", "蝴蝶機夾胸"],
    2: ["深蹲", "腿推", "腿屈伸", "硬舉"],
    3: ["杠鈴划船","滑輪下拉","引體向上" ],
    4: ["槓鈴肩推", "側平舉", "後三角肌飛鳥"],
    5: ["槓鈴彎舉", "錘式彎舉"],
    6: ["cable 三頭下壓", "仰臥肱三頭伸展"],
    7: ["棒式", "卷腹", "斜板抬腿"]
}

for category_id, exercises in exerciseData.items():
    for ex in exercises:
        if not db.query(Exercise).filter(Exercise.name == ex).first():
            db.add(Exercise(name=ex, body_part_id=category_id))

db.commit()
db.close()
print("Exercises inserted!")