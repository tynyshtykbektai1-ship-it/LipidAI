import pandas as pd
import numpy as np
import joblib
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, r2_score
import matplotlib.pyplot as plt

# 1. Загрузка данных
# Используем decimal=",", если в числах запятые. Если точки — замени на "."
df = pd.read_csv("inner_Training.csv", decimal=",")

# 2. Очистка и фильтрация
# Оставляем только те признаки, которые показали высокую корреляцию
target = "LDL-C"
features = ['TC', 'HDL-C', 'TG'] # Убрали Age и Gender, так как они "шумят"

# Убеждаемся, что все данные числовые (убираем ошибки чтения)
for col in features + [target]:
    df[col] = pd.to_numeric(df[col], errors='coerce')

# Удаляем пустые строки, которые могли появиться после конвертации
df = df.dropna(subset=features + [target])

X = df[features]
y = df[target]

# 3. Разделение на выборки
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# 4. Обучение модели
# Используем параметры, которые сбалансированы по скорости и точности
print("Начинаю обучение на 100 000 строк...")
model = RandomForestRegressor(
    n_estimators=100, 
    max_depth=20,        # Ограничение глубины для стабильности
    min_samples_leaf=5,   # Чтобы модель не "зазубривала" шум
    n_jobs=-1,           # Используем все ядра процессора
    random_state=42
)

model.fit(X_train, y_train)
print("Обучение завершено!")

# 5. Оценка результатов
y_pred = model.predict(X_test)
mae = mean_absolute_error(y_test, y_pred)
r2 = r2_score(y_test, y_pred)

print("-" * 30)
print(f"Средняя ошибка (MAE): {mae:.3f}")
print(f"Точность (R²): {r2:.3f}")
print("-" * 30)

# 6. Сохранение модели для использования с ESP32 (через ноутбук)
joblib.dump(model, "/content/final_lipid_model.pkl")
print("Модель сохранена как final_lipid_model.pkl")

# 7. Визуализация важности признаков
importances = model.feature_importances_
indices = np.argsort(importances)

plt.figure(figsize=(10, 5))
plt.title("Важность признаков для предсказания LDL")
plt.barh(range(len(indices)), importances[indices], align='center')
plt.yticks(range(len(indices)), [features[i] for i in indices])
plt.xlabel("Относительная важность")
plt.show()