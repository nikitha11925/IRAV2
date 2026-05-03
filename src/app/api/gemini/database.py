# from datetime import datetime

# class Database:
#     def __init__(self):
#         self.users = [
#             {"id": 1, "name": "Ravi Kumar", "role": "worker", "username": "ravi", "password": "worker123"},
#             {"id": 2, "name": "Anita Sharma", "role": "manager", "username": "anita", "password": "manager123"},
#             {"id": 3, "name": "Vikram Singh", "role": "driver", "username": "vikram", "password": "driver123"},
#             {"id": 4, "name": "Admin", "role": "admin", "username": "admin", "password": "admin123"},
#         ]

#         self.inventory = [
#             {"item": "A42", "location": "Bay 3, Shelf 2", "quantity": 245, "status": "available"},
#             {"item": "B17", "location": "Bay 1, Shelf 5", "quantity": 12, "status": "low_stock"},
#             {"item": "C89", "location": "Dock 4", "quantity": 3, "status": "critical"},
#         ]

#         self.alerts = []
#         self.logs = []
#         self.shipments = [{"id": "SHIP-7842", "status": "on_time"}]

#     def get_user(self, username, password):
#         return next((u for u in self.users if u["username"] == username and u["password"] == password), None)

#     def create_alert(self, data):
#         data["id"] = len(self.alerts) + 1
#         data["timestamp"] = datetime.now().isoformat()
#         self.alerts.append(data)
#         return data

#     def log_action(self, user, action, details):
#         self.logs.append({
#             "timestamp": datetime.now().isoformat(),
#             "user": user["name"],
#             "role": user["role"],
#             "action": action,
#             "details": details
#         })

# db = Database()