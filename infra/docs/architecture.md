1. Global Architecture

This is a web application , Users a reverse proxy  Backend is split into microservices , all services are containerized 

2. Services section 
Example format

### Backend API 

Role:
    - Handles authentication , users and business logic
    - Acts as the main backend entry point for the frontend

Netwroks:
    - Internal netwrork only 

Communicates with:
    - Game Service
    - Database

Does Not communicate with: 
    - Browser directly 



3. Networking Model

we use public network purpose is to let the client to connect form the browser to nginx
and then we use internal netwrok his purpose is to protect the backend service and database from attacks that's why weuse internal netwrok , and about comminucation is done like this nginx talk to frontend and frontend to backend-API and backend-API chose which service should he call my be it would a game service and the game service call the  database and if there also another service the backend-API he call it and this service call the database service in short every service under backend-api can call the database but frontend or browser  can't call it directly.

4. Data flow 
example 

    1. Browser send HTTPS request to Nginx
    2. Nginx serves fronted or proxies API requests
    3. Backend API process request
    4. Backend API comminucates with Game service if needed
    5. Backend API reads/writes database 
