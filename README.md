## Prerequisites
AlphaVantage API key  
Nodejs,npm,python,pip installed

## Environmnt Variables
Schema is defined in backend/djangoapp/models.py
APIs are defined in backend/djangoapp/views.py
API KEY ,MongoDB URI should be replaced in views.py 


## Installation
git clone {clone url}  
cd test  
npm i --legacy-peer-deps  
npm run dev  

## This will start frontend of app at http://localhost:3000

## Backend  Installation
cd test
cd backend/backend
pip install Django
pip install pymongo
pip install django-cors-headers
python3 manage.py runserver

##This will start backend at http://localhost:8000
