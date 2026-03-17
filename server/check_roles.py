#!/usr/bin/env python
import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from database import db

roles = list(db.get_collection('roles').find())
print(f'Total roles in DB: {len(roles)}')
for r in roles:
    perms = r.get('permissions', [])
    print(f'  - {r.get("name")} (ID: {r.get("_id")})')
    print(f'    Permissions: {perms[:3]}... ({len(perms)} total)')

# Check if Employee role exists
employee_role = db.get_collection('roles').find_one({'name': 'Employee'})
print(f'\nEmployee role exists: {employee_role is not None}')
if employee_role:
    print(f'Employee role ID: {employee_role.get("_id")}')
