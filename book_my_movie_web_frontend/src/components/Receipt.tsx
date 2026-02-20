import React from 'react';
import { Booking, PaymentResponse } from '../types';

interface ReceiptProps {
  booking: Booking;
  payment: PaymentResponse;
}

const Receipt: React.FC<ReceiptProps> = ({ booking, payment }) => {
  return (
    <div style={{
      backgroundColor: 'white',
      padding: '30px',
      borderRadius: '8px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
      maxWidth: '600px',
      margin: '0 auto',
      fontFamily: 'monospace'
    }}>
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h2 style={{ margin: 0, color: '#333' }}>Movie Booking System</h2>
        <p style={{ margin: '5px 0 0', color: '#666' }}>Payment Receipt</p>
      </div>
      
      <div style={{
        borderBottom: '2px dashed #ddd',
        paddingBottom: '20px',
        marginBottom: '20px'
      }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          marginBottom: '10px'
        }}>
          <span style={{ color: '#666' }}>Transaction ID:</span>
          <span style={{ fontWeight: 'bold' }}>{payment.transactionId}</span>
        </div>
        
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          marginBottom: '10px'
        }}>
          <span style={{ color: '#666' }}>Date:</span>
          <span>{new Date(payment.timestamp).toLocaleDateString()}</span>
        </div>
        
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          marginBottom: '10px'
        }}>
          <span style={{ color: '#666' }}>Time:</span>
          <span>{new Date(payment.timestamp).toLocaleTimeString()}</span>
        </div>
      </div>
      
      <div style={{ marginBottom: '30px' }}>
        <h3 style={{ color: '#333', marginBottom: '15px' }}>Booking Details</h3>
        
        <div style={{ 
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '10px',
          marginBottom: '10px'
        }}>
          <div>
            <div style={{ color: '#666', fontSize: '14px' }}>Booking ID</div>
            <div style={{ fontWeight: 'bold' }}>#{booking.id}</div>
          </div>
          
          <div>
            <div style={{ color: '#666', fontSize: '14px' }}>Seats</div>
            <div style={{ fontWeight: 'bold' }}>{booking.seats_selected}</div>
          </div>
          
          <div>
            <div style={{ color: '#666', fontSize: '14px' }}>Total Seats</div>
            <div>{booking.total_seats}</div>
          </div>
          
          <div>
            <div style={{ color: '#666', fontSize: '14px' }}>Amount Paid</div>
            <div style={{ color: '#28a745', fontWeight: 'bold' }}>
              ${booking.total_amount.toFixed(2)}
            </div>
          </div>
        </div>
      </div>
      
      <div style={{
        backgroundColor: '#f8f9fa',
        padding: '20px',
        borderRadius: '6px',
        marginBottom: '30px'
      }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          marginBottom: '10px'
        }}>
          <span style={{ color: '#666' }}>Subtotal:</span>
          <span>${booking.total_amount.toFixed(2)}</span>
        </div>
        
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          marginBottom: '10px'
        }}>
          <span style={{ color: '#666' }}>Tax (0%):</span>
          <span>$0.00</span>
        </div>
        
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          borderTop: '1px solid #ddd',
          paddingTop: '10px',
          fontWeight: 'bold',
          fontSize: '18px'
        }}>
          <span>Total:</span>
          <span style={{ color: '#28a745' }}>
            ${booking.total_amount.toFixed(2)}
          </span>
        </div>
      </div>
      
      <div style={{ 
        textAlign: 'center', 
        color: '#666',
        fontSize: '12px',
        marginTop: '30px'
      }}>
        <p>Thank you for your booking!</p>
        <p>Please present this receipt at the cinema counter.</p>
        <p style={{ marginTop: '20px' }}>*** This is a demo receipt for testing purposes ***</p>
      </div>
    </div>
  );
};

export default Receipt;