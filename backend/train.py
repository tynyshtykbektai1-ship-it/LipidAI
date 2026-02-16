import pandas as pd
import numpy as np
import joblib
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, r2_score
import matplotlib.pyplot as plt
from sklearn.metrics import mean_squared_error
import math

df = pd.read_csv("inner_Training.csv", decimal=",")

target = "LDL-C"
features = ['TC', 'HDL-C', 'TG'] 

for col in features + [target]:
    df[col] = pd.to_numeric(df[col], errors='coerce')

df = df.dropna(subset=features + [target])

X = df[features]
y = df[target]

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

print("Начинаю обучение на 100 000 строк...")
model = RandomForestRegressor(
    n_estimators=100, 
    max_depth=20,        
    min_samples_leaf=5,   
    n_jobs=-1,           
    random_state=42
)

model.fit(X_train, y_train)
print("Обучение завершено!")

joblib.dump(model, "/content/final_lipid_model.pkl")
print("Модель сохранена как final_lipid_model.pkl")
y_pred = model.predict(X_test)

mae = mean_absolute_error(y_test, y_pred)
r2 = r2_score(y_test, y_pred)
mse = mean_squared_error(y_test, y_pred)
rmse = math.sqrt(mse)

print(f"MAE (Mean Absolute Error): {mae:.2f} mm")
print(f"R² (Coefficient of Determination): {r2:.3f}")
print(f"MSE (Mean Squared Error): {mse:.4f}")
print(f"RMSE (Root MSE): {rmse:.4f}")

plt.figure(figsize=(10, 7))
plt.scatter(y_test, y_pred, color='dodgerblue', alpha=0.7, edgecolors='k', label='Test Data')
plt.plot([y_test.min(), y_test.max()], [y_test.min(), y_test.max()], 'r--', lw=2, label='Ideal Prediction')
plt.title('Actual vs Predicted Thickness Loss', fontsize=16, fontweight='bold')
plt.xlabel('Actual Thickness Loss (mm)', fontsize=14)
plt.ylabel('Predicted Thickness Loss (mm)', fontsize=14)

metrics_text = f'MAE: {mae:.4f}\nMSE: {mse:.4f}\nR²: {r2:.4f}'
plt.text(0.05, 0.95, metrics_text, transform=plt.gca().transAxes, fontsize=12, 
         verticalalignment='top', bbox=dict(boxstyle='round', facecolor='wheat', alpha=0.8))
plt.legend(fontsize=12)
plt.grid(True, linestyle='--', alpha=0.6)
plt.tight_layout()
plt.savefig("plot_actual_vs_pred.png", dpi=300)
plt.close()  

errors = y_test - y_pred
plt.figure(figsize=(10, 7))
plt.hist(errors, bins=30, color='mediumseagreen', edgecolor='black', alpha=0.8)
plt.axvline(0, color='red', linestyle='dashed', linewidth=2)
plt.title('Prediction Error Distribution', fontsize=16, fontweight='bold')
plt.xlabel('Prediction Error (mm)', fontsize=14)
plt.ylabel('Frequency', fontsize=14)
plt.grid(axis='y', linestyle='--', alpha=0.6)
plt.tight_layout()
plt.savefig("plot_error_hist.png", dpi=300)
plt.close()  
importances = model.feature_importances_
indices = np.argsort(importances)[::-1]

plt.figure(figsize=(12, 8))
plt.barh(range(len(indices)), importances[indices], color='orange', align='center', edgecolor='black')
plt.yticks(range(len(indices)), [X.columns[i] for i in indices])
plt.gca().invert_yaxis()
plt.title('Feature Importance for Thickness Loss Prediction', fontsize=16, fontweight='bold')
plt.xlabel('Relative Importance', fontsize=14)
plt.tight_layout()
plt.savefig("plot_feature_importance.png", dpi=300)
plt.close()  

print("All plots saved: plot_actual_vs_pred.png, plot_error_hist.png, plot_feature_importance.png")
