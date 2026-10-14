import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Business, Customer, Supplier, Transaction, Invoice, Product, Expense, Reminder } from '../types';
import { useAuth } from './AuthContext';
import { handleFirestoreError, OperationType } from '../lib/firestore-errors';

export const ADMIN_BUSINESS_ID = 'biz_sharma_store';
export const ADMIN_PRIMARY_EMAIL = 'kunalqaz1@gmail.com';

interface BusinessContextType {
  businesses: Business[];
  activeBusiness: Business | null;
  loading: boolean;
  isAuthorized: boolean;
  isAdmin: boolean;
  customers: Customer[];
  suppliers: Supplier[];
  transactions: Transaction[];
  invoices: Invoice[];
  products: Product[];
  expenses: Expense[];
  reminders: Reminder[];
  grantAccessEmail: (email: string) => Promise<void>;
  revokeAccessEmail: (email: string) => Promise<void>;
  updateBusiness: (data: Partial<Business>) => Promise<void>;
  addCustomer: (data: Omit<Customer, 'id' | 'businessId' | 'currentBalance' | 'createdAt' | 'updatedAt' | 'createdBy' | 'status'>) => Promise<Customer>;
  updateCustomer: (id: string, data: Partial<Customer>) => Promise<void>;
  deleteCustomer: (id: string) => Promise<void>;
  addSupplier: (data: Omit<Supplier, 'id' | 'businessId' | 'currentBalance' | 'createdAt' | 'updatedAt' | 'createdBy' | 'status'>) => Promise<Supplier>;
  updateSupplier: (id: string, data: Partial<Supplier>) => Promise<void>;
  deleteSupplier: (id: string) => Promise<void>;
  recordTransaction: (data: {
    partyType: 'customer' | 'supplier';
    partyId: string;
    type: 'you_gave' | 'you_got' | 'payment_in' | 'payment_out';
    amount: number;
    paymentMethod: 'cash' | 'upi' | 'bank_transfer' | 'cheque' | 'card' | 'other';
    paymentRef?: string;
    description?: string;
    billNumber?: string;
    date: string;
  }) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  createInvoice: (data: Omit<Invoice, 'id' | 'businessId' | 'createdAt' | 'updatedAt' | 'createdBy'>) => Promise<Invoice>;
  updateInvoiceStatus: (id: string, status: Invoice['status'], paidAmount?: number) => Promise<void>;
  addProduct: (data: Omit<Product, 'id' | 'businessId' | 'createdAt' | 'updatedAt' | 'createdBy'>) => Promise<Product>;
  updateProductStock: (id: string, changeQty: number) => Promise<void>;
  addExpense: (data: Omit<Expense, 'id' | 'businessId' | 'createdAt' | 'updatedAt' | 'createdBy'>) => Promise<Expense>;
  addReminder: (data: Omit<Reminder, 'id' | 'businessId' | 'createdAt' | 'updatedAt' | 'createdBy'>) => Promise<Reminder>;
  updateReminderStatus: (id: string, status: Reminder['status']) => Promise<void>;
}

const BusinessContext = createContext<BusinessContextType | undefined>(undefined);

export const BusinessProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, profile } = useAuth();
  const [activeBusiness, setActiveBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);

  // Active business sub-collections
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);

  const effectiveUserId = user?.uid || profile?.uid || 'merchant_kunal';
  const currentEmail = (profile?.email || user?.email || '').toLowerCase().trim();

  // 1. Fetch the single Admin Business in real-time
  useEffect(() => {
    setLoading(true);
    const bizRef = doc(db, 'businesses', ADMIN_BUSINESS_ID);

    const unsubscribe = onSnapshot(
      bizRef,
      async (snap) => {
        if (snap.exists()) {
          const data = { id: snap.id, ...(snap.data() as Omit<Business, 'id'>) };
          setActiveBusiness(data);
        } else {
          // Initialize Anu Tools store if not exists
          const initialBiz: Business = {
            id: ADMIN_BUSINESS_ID,
            name: 'Anu Tools and Service Center',
            businessType: 'Tools, Hardware & Machinery Spares',
            ownerId: 'merchant_kunal',
            ownerEmail: ADMIN_PRIMARY_EMAIL,
            allowedEmails: [ADMIN_PRIMARY_EMAIL],
            phone: '+91 98765 43210',
            email: ADMIN_PRIMARY_EMAIL,
            address: 'Shop No. 4, Industrial Area, Phase II',
            city: 'Ahmedabad',
            state: 'Gujarat',
            pincode: '380015',
            currency: 'INR',
            currencySymbol: '₹',
            gstin: '24AAAAA0000A1Z5',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          try {
            await setDoc(bizRef, initialBiz);
            setActiveBusiness(initialBiz);
          } catch (err) {
            console.error("Error creating admin business:", err);
            setActiveBusiness(initialBiz);
          }
        }
        setLoading(false);
      },
      (error) => {
        console.error("Firestore business listener error:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Check authorization
  const allowedEmailsList = (activeBusiness?.allowedEmails || [ADMIN_PRIMARY_EMAIL]).map((e) =>
    e.toLowerCase().trim()
  );
  const isUserAdmin = currentEmail === ADMIN_PRIMARY_EMAIL;
  const isAuthorized = Boolean(
    currentEmail && (isUserAdmin || allowedEmailsList.includes(currentEmail))
  );

  // 2. Fetch subcollections for activeBusiness directly from Cloud Firestore
  useEffect(() => {
    if (!activeBusiness) {
      setCustomers([]);
      setSuppliers([]);
      setTransactions([]);
      setInvoices([]);
      setProducts([]);
      setExpenses([]);
      setReminders([]);
      return;
    }

    const bId = activeBusiness.id;

    // Real-time Customers Listener
    const unCust = onSnapshot(
      collection(db, 'businesses', bId, 'customers'),
      (snap) => {
        const arr: Customer[] = [];
        snap.forEach((d) => arr.push({ id: d.id, ...(d.data() as Omit<Customer, 'id'>) }));
        arr.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
        setCustomers(arr);
      },
      (err) => console.warn("Customers snapshot error:", err)
    );

    // Real-time Suppliers Listener
    const unSup = onSnapshot(
      collection(db, 'businesses', bId, 'suppliers'),
      (snap) => {
        const arr: Supplier[] = [];
        snap.forEach((d) => arr.push({ id: d.id, ...(d.data() as Omit<Supplier, 'id'>) }));
        arr.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
        setSuppliers(arr);
      },
      (err) => console.warn("Suppliers snapshot error:", err)
    );

    // Real-time Transactions Listener
    const unTx = onSnapshot(
      collection(db, 'businesses', bId, 'transactions'),
      (snap) => {
        const arr: Transaction[] = [];
        snap.forEach((d) => arr.push({ id: d.id, ...(d.data() as Omit<Transaction, 'id'>) }));
        arr.sort((a, b) => new Date(b.date || b.createdAt || 0).getTime() - new Date(a.date || a.createdAt || 0).getTime());
        setTransactions(arr);
      },
      (err) => console.warn("Transactions snapshot error:", err)
    );

    // Real-time Invoices Listener
    const unInv = onSnapshot(
      collection(db, 'businesses', bId, 'invoices'),
      (snap) => {
        const arr: Invoice[] = [];
        snap.forEach((d) => arr.push({ id: d.id, ...(d.data() as Omit<Invoice, 'id'>) }));
        arr.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
        setInvoices(arr);
      },
      (err) => console.warn("Invoices snapshot error:", err)
    );

    // Real-time Products Listener
    const unProd = onSnapshot(
      collection(db, 'businesses', bId, 'products'),
      (snap) => {
        const arr: Product[] = [];
        snap.forEach((d) => arr.push({ id: d.id, ...(d.data() as Omit<Product, 'id'>) }));
        arr.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
        setProducts(arr);
      },
      (err) => console.warn("Products snapshot error:", err)
    );

    // Real-time Expenses Listener
    const unExp = onSnapshot(
      collection(db, 'businesses', bId, 'expenses'),
      (snap) => {
        const arr: Expense[] = [];
        snap.forEach((d) => arr.push({ id: d.id, ...(d.data() as Omit<Expense, 'id'>) }));
        arr.sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime());
        setExpenses(arr);
      },
      (err) => console.warn("Expenses snapshot error:", err)
    );

    // Real-time Reminders Listener
    const unRem = onSnapshot(
      collection(db, 'businesses', bId, 'reminders'),
      (snap) => {
        const arr: Reminder[] = [];
        snap.forEach((d) => arr.push({ id: d.id, ...(d.data() as Omit<Reminder, 'id'>) }));
        setReminders(arr);
      },
      (err) => console.warn("Reminders snapshot error:", err)
    );

    return () => {
      unCust();
      unSup();
      unTx();
      unInv();
      unProd();
      unExp();
      unRem();
    };
  }, [activeBusiness?.id]);

  // Grant access to an email (Admin only)
  const grantAccessEmail = async (email: string) => {
    const clean = email.toLowerCase().trim();
    if (!clean || !activeBusiness) return;
    const current = activeBusiness.allowedEmails || [ADMIN_PRIMARY_EMAIL];
    if (!current.map((e) => e.toLowerCase().trim()).includes(clean)) {
      const updated = [...current, clean];
      try {
        await updateDoc(doc(db, 'businesses', activeBusiness.id), {
          allowedEmails: updated,
          updatedAt: new Date().toISOString(),
        });
        setActiveBusiness((prev) => (prev ? { ...prev, allowedEmails: updated } : null));
      } catch (err) {
        console.error("Error granting access:", err);
      }
    }
  };

  // Revoke access from an email (Admin only)
  const revokeAccessEmail = async (email: string) => {
    const clean = email.toLowerCase().trim();
    if (!clean || clean === ADMIN_PRIMARY_EMAIL || !activeBusiness) return;
    const current = activeBusiness.allowedEmails || [ADMIN_PRIMARY_EMAIL];
    const updated = current.filter((e) => e.toLowerCase().trim() !== clean);
    try {
      await updateDoc(doc(db, 'businesses', activeBusiness.id), {
        allowedEmails: updated,
        updatedAt: new Date().toISOString(),
      });
      setActiveBusiness((prev) => (prev ? { ...prev, allowedEmails: updated } : null));
    } catch (err) {
      console.error("Error revoking access:", err);
    }
  };

  const updateBusiness = async (data: Partial<Business>) => {
    if (!activeBusiness) return;
    const updated = { ...activeBusiness, ...data, updatedAt: new Date().toISOString() };
    setActiveBusiness(updated);
    try {
      await updateDoc(doc(db, 'businesses', activeBusiness.id), data);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `businesses/${activeBusiness.id}`);
      throw error;
    }
  };

  const addCustomer = async (
    data: Omit<Customer, 'id' | 'businessId' | 'currentBalance' | 'createdAt' | 'updatedAt' | 'createdBy' | 'status'>
  ) => {
    if (!activeBusiness) throw new Error('No active business found');
    const newId = 'cust_' + Date.now();
    const openingBal = data.openingBalance || 0;
    const newCust: Customer = {
      ...data,
      id: newId,
      businessId: activeBusiness.id,
      currentBalance: openingBal,
      status: 'active',
      createdBy: effectiveUserId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setCustomers((prev) => [newCust, ...prev]);

    try {
      await setDoc(doc(db, 'businesses', activeBusiness.id, 'customers', newId), newCust);

      if (openingBal !== 0) {
        const txId = 'tx_' + Date.now();
        const txType = openingBal > 0 ? 'you_gave' : 'you_got';
        const initialTx: Transaction = {
          id: txId,
          businessId: activeBusiness.id,
          partyType: 'customer',
          partyId: newId,
          type: txType,
          amount: Math.abs(openingBal),
          paymentMethod: 'other',
          description: 'Opening Balance',
          date: new Date().toISOString(),
          createdBy: effectiveUserId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        await setDoc(doc(db, 'businesses', activeBusiness.id, 'transactions', txId), initialTx);
      }
      return newCust;
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `businesses/${activeBusiness.id}/customers/${newId}`);
      throw error;
    }
  };

  const updateCustomer = async (id: string, data: Partial<Customer>) => {
    if (!activeBusiness) return;
    setCustomers((prev) => prev.map((c) => (c.id === id ? { ...c, ...data } : c)));
    try {
      await updateDoc(doc(db, 'businesses', activeBusiness.id, 'customers', id), {
        ...data,
        updatedAt: new Date().toISOString(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `businesses/${activeBusiness.id}/customers/${id}`);
      throw error;
    }
  };

  const deleteCustomer = async (id: string) => {
    if (!activeBusiness) return;
    setCustomers((prev) => prev.filter((c) => c.id !== id));
    try {
      await deleteDoc(doc(db, 'businesses', activeBusiness.id, 'customers', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `businesses/${activeBusiness.id}/customers/${id}`);
      throw error;
    }
  };

  const addSupplier = async (
    data: Omit<Supplier, 'id' | 'businessId' | 'currentBalance' | 'createdAt' | 'updatedAt' | 'createdBy' | 'status'>
  ) => {
    if (!activeBusiness) throw new Error('No active business found');
    const newId = 'sup_' + Date.now();
    const openingBal = data.openingBalance || 0;
    const newSup: Supplier = {
      ...data,
      id: newId,
      businessId: activeBusiness.id,
      currentBalance: openingBal,
      status: 'active',
      createdBy: effectiveUserId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setSuppliers((prev) => [newSup, ...prev]);

    try {
      await setDoc(doc(db, 'businesses', activeBusiness.id, 'suppliers', newId), newSup);
      return newSup;
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `businesses/${activeBusiness.id}/suppliers/${newId}`);
      throw error;
    }
  };

  const updateSupplier = async (id: string, data: Partial<Supplier>) => {
    if (!activeBusiness) return;
    setSuppliers((prev) => prev.map((s) => (s.id === id ? { ...s, ...data } : s)));
    try {
      await updateDoc(doc(db, 'businesses', activeBusiness.id, 'suppliers', id), {
        ...data,
        updatedAt: new Date().toISOString(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `businesses/${activeBusiness.id}/suppliers/${id}`);
      throw error;
    }
  };

  const deleteSupplier = async (id: string) => {
    if (!activeBusiness) return;
    setSuppliers((prev) => prev.filter((s) => s.id !== id));
    try {
      await deleteDoc(doc(db, 'businesses', activeBusiness.id, 'suppliers', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `businesses/${activeBusiness.id}/suppliers/${id}`);
      throw error;
    }
  };

  const recordTransaction = async (data: {
    partyType: 'customer' | 'supplier';
    partyId: string;
    type: 'you_gave' | 'you_got' | 'payment_in' | 'payment_out';
    amount: number;
    paymentMethod: 'cash' | 'upi' | 'bank_transfer' | 'cheque' | 'card' | 'other';
    paymentRef?: string;
    description?: string;
    billNumber?: string;
    date: string;
  }) => {
    if (!activeBusiness) throw new Error('No active business found');
    const newId = 'tx_' + Date.now();
    const tx: Transaction = {
      ...data,
      id: newId,
      businessId: activeBusiness.id,
      createdBy: effectiveUserId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setTransactions((prev) => [tx, ...prev]);

    // Recalculate customer/supplier balance
    if (data.partyType === 'customer') {
      const cust = customers.find((c) => c.id === data.partyId);
      if (cust) {
        const delta = data.type === 'you_gave' ? data.amount : -data.amount;
        const newBalance = cust.currentBalance + delta;
        setCustomers((prev) => prev.map((c) => (c.id === data.partyId ? { ...c, currentBalance: newBalance } : c)));
        await updateDoc(doc(db, 'businesses', activeBusiness.id, 'customers', data.partyId), {
          currentBalance: newBalance,
          updatedAt: new Date().toISOString(),
        });
      }
    } else {
      const sup = suppliers.find((s) => s.id === data.partyId);
      if (sup) {
        const delta = data.type === 'payment_in' ? data.amount : -data.amount;
        const newBalance = sup.currentBalance + delta;
        setSuppliers((prev) => prev.map((s) => (s.id === data.partyId ? { ...s, currentBalance: newBalance } : s)));
        await updateDoc(doc(db, 'businesses', activeBusiness.id, 'suppliers', data.partyId), {
          currentBalance: newBalance,
          updatedAt: new Date().toISOString(),
        });
      }
    }

    try {
      await setDoc(doc(db, 'businesses', activeBusiness.id, 'transactions', newId), tx);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `businesses/${activeBusiness.id}/transactions/${newId}`);
      throw error;
    }
  };

  const deleteTransaction = async (id: string) => {
    if (!activeBusiness) return;
    const tx = transactions.find((t) => t.id === id);
    if (!tx) return;

    // Reverse balance
    if (tx.partyType === 'customer') {
      const cust = customers.find((c) => c.id === tx.partyId);
      if (cust) {
        const delta = tx.type === 'you_gave' ? -tx.amount : tx.amount;
        const newBalance = cust.currentBalance + delta;
        setCustomers((prev) => prev.map((c) => (c.id === tx.partyId ? { ...c, currentBalance: newBalance } : c)));
        await updateDoc(doc(db, 'businesses', activeBusiness.id, 'customers', tx.partyId), {
          currentBalance: newBalance,
        });
      }
    }

    setTransactions((prev) => prev.filter((t) => t.id !== id));
    try {
      await deleteDoc(doc(db, 'businesses', activeBusiness.id, 'transactions', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `businesses/${activeBusiness.id}/transactions/${id}`);
      throw error;
    }
  };

  const createInvoice = async (
    data: Omit<Invoice, 'id' | 'businessId' | 'createdAt' | 'updatedAt' | 'createdBy'>
  ) => {
    if (!activeBusiness) throw new Error('No active business found');
    const newId = 'inv_' + Date.now();
    const invoice: Invoice = {
      ...data,
      id: newId,
      businessId: activeBusiness.id,
      createdBy: effectiveUserId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setInvoices((prev) => [invoice, ...prev]);

    try {
      await setDoc(doc(db, 'businesses', activeBusiness.id, 'invoices', newId), invoice);
      return invoice;
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `businesses/${activeBusiness.id}/invoices/${newId}`);
      throw error;
    }
  };

  const updateInvoiceStatus = async (id: string, status: Invoice['status'], paidAmount?: number) => {
    if (!activeBusiness) return;
    setInvoices((prev) =>
      prev.map((inv) =>
        inv.id === id ? { ...inv, status, ...(paidAmount !== undefined ? { paidAmount } : {}) } : inv
      )
    );
    try {
      const invRef = doc(db, 'businesses', activeBusiness.id, 'invoices', id);
      const updateData: Record<string, unknown> = { status, updatedAt: new Date().toISOString() };
      if (paidAmount !== undefined) {
        updateData.paidAmount = paidAmount;
      }
      await updateDoc(invRef, updateData);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `businesses/${activeBusiness.id}/invoices/${id}`);
      throw error;
    }
  };

  const addProduct = async (
    data: Omit<Product, 'id' | 'businessId' | 'createdAt' | 'updatedAt' | 'createdBy'>
  ) => {
    if (!activeBusiness) throw new Error('No active business selected');
    const newId = 'prod_' + Date.now();
    const product: Product = {
      ...data,
      id: newId,
      businessId: activeBusiness.id,
      createdBy: effectiveUserId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setProducts((prev) => [product, ...prev]);

    try {
      await setDoc(doc(db, 'businesses', activeBusiness.id, 'products', newId), product);
      return product;
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `businesses/${activeBusiness.id}/products/${newId}`);
      throw error;
    }
  };

  const updateProductStock = async (id: string, changeQty: number) => {
    if (!activeBusiness) return;
    const prod = products.find((p) => p.id === id);
    if (!prod) return;
    const newStock = Math.max(0, prod.currentStock + changeQty);
    try {
      await updateDoc(doc(db, 'businesses', activeBusiness.id, 'products', id), {
        currentStock: newStock,
        updatedAt: new Date().toISOString(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `businesses/${activeBusiness.id}/products/${id}`);
    }
  };

  const addExpense = async (
    data: Omit<Expense, 'id' | 'businessId' | 'createdAt' | 'updatedAt' | 'createdBy'>
  ) => {
    if (!activeBusiness) throw new Error('No active business selected');
    const newId = 'exp_' + Date.now();
    const exp: Expense = {
      ...data,
      id: newId,
      businessId: activeBusiness.id,
      createdBy: effectiveUserId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setExpenses((prev) => [exp, ...prev]);

    try {
      await setDoc(doc(db, 'businesses', activeBusiness.id, 'expenses', newId), exp);
      return exp;
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `businesses/${activeBusiness.id}/expenses/${newId}`);
      throw error;
    }
  };

  const addReminder = async (
    data: Omit<Reminder, 'id' | 'businessId' | 'createdAt' | 'updatedAt' | 'createdBy'>
  ) => {
    if (!activeBusiness) throw new Error('No active business selected');
    const newId = 'rem_' + Date.now();
    const reminder: Reminder = {
      ...data,
      id: newId,
      businessId: activeBusiness.id,
      createdBy: effectiveUserId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setReminders((prev) => [reminder, ...prev]);

    try {
      await setDoc(doc(db, 'businesses', activeBusiness.id, 'reminders', newId), reminder);
      return reminder;
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `businesses/${activeBusiness.id}/reminders/${newId}`);
      throw error;
    }
  };

  const updateReminderStatus = async (id: string, status: Reminder['status']) => {
    if (!activeBusiness) return;
    try {
      await updateDoc(doc(db, 'businesses', activeBusiness.id, 'reminders', id), {
        status,
        updatedAt: new Date().toISOString(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `businesses/${activeBusiness.id}/reminders/${id}`);
    }
  };

  return (
    <BusinessContext.Provider
      value={{
        businesses: activeBusiness ? [activeBusiness] : [],
        activeBusiness,
        loading,
        isAuthorized,
        isAdmin: isUserAdmin,
        customers,
        suppliers,
        transactions,
        invoices,
        products,
        expenses,
        reminders,
        grantAccessEmail,
        revokeAccessEmail,
        updateBusiness,
        addCustomer,
        updateCustomer,
        deleteCustomer,
        addSupplier,
        updateSupplier,
        deleteSupplier,
        recordTransaction,
        deleteTransaction,
        createInvoice,
        updateInvoiceStatus,
        addProduct,
        updateProductStock,
        addExpense,
        addReminder,
        updateReminderStatus,
      }}
    >
      {children}
    </BusinessContext.Provider>
  );
};

export const useBusiness = () => {
  const context = useContext(BusinessContext);
  if (!context) {
    throw new Error('useBusiness must be used within a BusinessProvider');
  }
  return context;
};
