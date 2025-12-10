# AgriFlow

**Course:** Electronic Business Development (BINF 503)  
**Semester:** Winter 2025  
**Instructor:** Dr. Nourhan Hamdi  
**Teaching Assistants:** Mr. Nour Gaser, Mr. Omar Alaa

---

## 1. Team Members

| Name           | Student ID | Tutorial Group | GitHub Username |
| :------------- | :--------- | :------------- | :-------------- |
| [Yusuf Sallam] | [13004663] | [T8]           | [@TheSallam]    |
| [Seif Ihab]    | [13006958] | [T8]           | [@SeifSalem1]   |
| [Miriam amgad] | [13003103] | [T8]           | [@miriamamgad]  |
| [Adham Amr]    | [13002404] | [T8]           | [@Adhamalyy]    |

---

## 2. Project Description

_This project aims to empower smallholder farmers in Egypt by developing a digital B2B marketplace platform that connects them directly with verified local and international buyers. The solution breaks farmers’ dependence on middlemen by offering an online platform for transparent product listing, real-time pricing, and instant, secure digital payments. The platform captures transaction history to build credit profiles, making unbanked farmers eligible for financing and financial services. Through partnerships with agricultural cooperatives and integration with trusted providers like Meeza and CBE, the project targets over 2 million farmers and leverages Egypt’s expanding mobile coverage for rural inclusion. The goal is to increase farmer revenues, improve market access, and promote financial inclusion using a scalable, purpose-built fintech solution for Egypt’s agricultural sector._

- **Concept:** A digital platform connecting smallholder farmers directly with verified buyers to eliminate middlemen, provide transparent pricing, secure payments, and enable financial inclusion through transaction history and credit profiles.
- **Link to Fin-Tech Course Document:**

---

## 3. Feature Breakdown

### 3.1 Full Scope

- User Authentication and Profile Management (Farmers, Buyers, Admin)
- Product Listing and Management (Farmers list crops/products for sale)
- Real-time Market Pricing Dashboard
- Secure Digital Payments Integration (e.g., Meeza, CBE)
- Transaction History and Reporting (build farmer credit profiles)
- Buyer Verification and Rating System
- Order Management and Notifications
- Financing Application and Tracking
- Partnership Portal for Cooperatives
- Mobile App Support with Offline Capabilities
- Agricultural Market Insights and Alerts
- Multi-language Support

### 3.2 Selected MVP Use Cases (Course Scope)

1. User Authentication (Registration/Login)
2. Product Listing by Farmers
3. Viewing Product Listings by Buyers
4. Basic Buyer Verification
5. Recording Transaction History

---

## 4. Feature Assignments (Accountability)

| Team Member | Assigned Use Case                    | Brief Description of Responsibility              |
| :---------- | :----------------------------------- | :----------------------------------------------- |
| [Adham]     | **User Authentication**              | Register, Login, JWT handling, Password Hashing. |
| [Sallam]    | [Product Listing by Farmers]         | Create, update, and manage product listings      |
| [Sallam]    | [Viewing Product Listings by Buyers] | Browse and search products.                      |
| [Miriam]    | [Basic Buyer Verification]           | Verify buyer credentials and status              |
| [Seif]      | [Recording Transaction History]      | Log purchase transactions and maintain history.  |

---

## 5. Data Model (Initial Schemas)

### User Schema

```javascript
const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["farmer", "buyer", "admin"], required: true },
  createdAt: { type: Date, default: Date.now },
});
```

### [Product Listing] Schema

```javascript
const ProductSchema = new mongoose.Schema({
  farmerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  productName: { type: String, required: true },
  quantity: { type: Number, required: true },
  pricePerUnit: { type: Number, required: true },
  description: String,
  dateListed: { type: Date, default: Date.now },
});
```

### [Viewing Product Listings] Schema

```javascript
const ProductSchema = new mongoose.Schema({
  farmerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  productName: { type: String, required: true },
  quantity: { type: Number, required: true },
  pricePerUnit: { type: Number, required: true },
  description: String,
  dateListed: { type: Date, default: Date.now },
});
```

### [Buyer Verification] Schema

```javascript
const BuyerVerificationSchema = new mongoose.Schema({
  buyerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  verifiedStatus: { type: Boolean, default: false },
  verificationDate: Date,
  verifier: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Admin who verified
});
```

### [Transaction History] Schema

```javascript
const TransactionSchema = new mongoose.Schema({
  buyerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  quantityPurchased: { type: Number, required: true },
  totalPrice: { type: Number, required: true },
  transactionDate: { type: Date, default: Date.now },
});
```
