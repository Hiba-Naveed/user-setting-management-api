# User Settings Management API

A robust RESTful API built with Node.js and Express to manage user preferences and application settings seamlessly.

## 🚀 Features

- **Full CRUD Operations**: Create, Read, Update, and Delete user settings.
- **Input Validation**: Ensures required parameters are provided before processing requests.
- **Conflict Handling**: Prevents duplicate entries and handles missing user resources gracefully.
- **Modular Architecture**: Clean separation of routes, controllers, and data access layers.

## 🛠️ Tech Stack

- **Backend**: Node.js, Express.js
- **Data Persistence**: JSON / File System

## 📌 API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/settings` | Retrieve all user settings |
| `GET` | `/api/settings/:userId` | Retrieve settings for a specific user |
| `POST` | `/api/settings` | Create a new user settings record |
| `PUT` | `/api/settings/:userId` | Update existing user settings |
| `DELETE` | `/api/settings/:userId` | Delete user settings |

## ⚙️ Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm

### Installation & Setup

1. Clone the repository:
   ```bash
   git clone <YOUR_REPOSITORY_URL>
   cd "User Settings Management API"
