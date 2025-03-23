# WebRTC Application with Signaling Server

## Overview
This project demonstrates a **WebRTC application** that enables real-time peer-to-peer video streaming. It uses **Google's STUN server** and a **WebSocket-based signaling server** for connection setup.

## How It Works
1. **Signaling Server** (Runs on port `localhost:8080`):
   - Handles communication between peers using **WebSockets**.
   - Exchanges **SDP offers and answers** to establish the WebRTC connection.

2. **WebRTC Connection**:
   - Uses **Google's STUN server**: `stun:stun.l.google.com:19302` to discover public IPs.
   - Establishes a direct connection between peers after successful signaling.

---

## **Types of WebSocket Requests**

The signaling server handles multiple types of WebSocket messages to facilitate a WebRTC connection. Below is a description of each type:

### 1️⃣ **Identify Sender**
- **Type:** `identify-as-sender`
- **Purpose:** This request is sent by a client that wants to act as a **video sender**.
- **Action:** The signaling server marks this WebSocket connection as the **sender** and stores it for future communication.

### 2️⃣ **Identify Receiver**
- **Type:** `identify-as-reciever`
- **Purpose:** This request is sent by a client that wants to act as a **video receiver**.
- **Action:** The signaling server marks this WebSocket connection as the **receiver** and stores it for future communication.

### 3️⃣ **Create Offer**
- **Type:** `create-offer`
- **Purpose:** The sender initiates a WebRTC connection by generating an SDP **offer**.
- **Action:** The signaling server forwards this SDP offer to the receiver.

### 4️⃣ **Create Answer**
- **Type:** `create-answer`
- **Purpose:** After receiving an SDP **offer**, the receiver responds with an SDP **answer**.
- **Action:** The signaling server forwards this SDP answer to the sender.

### 5️⃣ **ICE Candidate Exchange**
- **Type:** `ice-candidate`
- **Purpose:** WebRTC requires **ICE candidates** for NAT traversal and establishing a peer-to-peer connection.
- **Action:** The signaling server relays ICE candidates between the sender and receiver to help establish a stable connection.

---

## **Project Components**
- **Frontend:** A simple interface to start and stop video streaming.
- **Backend:** A WebSocket-based signaling server running on **port 8080**.
- **WebRTC API:** Used to handle video streaming between peers.
- **STUN Server:** Google's public **STUN server** is used to determine external IP addresses.

## **How to Use**
1. **Start the WebSocket Signaling Server**.
2. **Run the WebRTC client application**.
3. **One peer acts as a sender**, and another as a **receiver**.
4. **SDP offers, answers, and ICE candidates are exchanged** via WebSocket.
5. Once signaling is complete, **WebRTC establishes a direct peer-to-peer connection**.

---

## **Technologies Used**
- **WebRTC API**
- **WebSockets**
- **Node.js (Backend)**
- **Google STUN Server**
- **React (Frontend)**

---

This project showcases a **fully functional WebRTC application** with a **WebSocket-based signaling server** to establish peer-to-peer video communication.
