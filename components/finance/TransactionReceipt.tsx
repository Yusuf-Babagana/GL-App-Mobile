import React from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet, Share } from 'react-native';
import { CheckCircle, Share2, X } from 'lucide-react-native';

interface ReceiptProps {
  visible: boolean;
  onClose: () => void;
  data: {
    amount: number;
    phone: string;
    orderId: string;
    planName: string;
  };
}

const TransactionReceipt: React.FC<ReceiptProps> = ({ visible, onClose, data }) => {
  const handleShare = async () => {
    try {
      await Share.share({
        message: `Purchase Successful!\nPlan: ${data.planName}\nAmount: ₦${data.amount}\nRef: ${data.orderId}`,
      });
    } catch (error) {

    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <X color="#999" size={24} />
          </TouchableOpacity>

          {/* Success Icon */}
          <View style={styles.iconWrapper}>
            <CheckCircle color="#329629" size={80} strokeWidth={1.5} />
          </View>

          <Text style={styles.successText}>Transaction Successful</Text>
          <Text style={styles.amountText}>₦{Number(data.amount).toLocaleString()}</Text>

          {/* Details Table */}
          <View style={styles.detailsContainer}>
            <DetailRow label="Product" value={data.planName} />
            <DetailRow label="Phone" value={data.phone} />
            <DetailRow label="Order ID" value={data.orderId} />
            <DetailRow label="Status" value="Success" isStatus />
          </View>

          {/* Actions */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.doneBtn} onPress={onClose}>
              <Text style={styles.doneBtnText}>Done</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.shareBtn} onPress={handleShare}>
              <Share2 color="#4ADE80" size={20} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const DetailRow = ({ label, value, isStatus }: any) => (
  <View style={styles.row}>
    <Text style={styles.label}>{label}</Text>
    <Text style={[styles.value, isStatus && styles.statusValue]}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', padding: 20 },
  container: { backgroundColor: '#FFF', borderRadius: 24, padding: 24, alignItems: 'center' },
  closeBtn: { alignSelf: 'flex-end' },
  iconWrapper: { marginBottom: 15 },
  successText: { fontSize: 18, color: '#666', marginBottom: 5 },
  amountText: { fontSize: 32, fontWeight: 'bold', color: '#1A1A1A', marginBottom: 25 },
  detailsContainer: { width: '100%', borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#F0F0F0', paddingVertical: 15, marginBottom: 25 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  label: { color: '#999', fontSize: 14 },
  value: { color: '#1A1A1A', fontWeight: '600', fontSize: 14 },
  statusValue: { color: '#329629' },
  footer: { flexDirection: 'row', alignItems: 'center' },
  doneBtn: { flex: 1, backgroundColor: '#4ADE80', height: 55, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  doneBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  shareBtn: { marginLeft: 15, width: 55, height: 55, borderRadius: 16, borderWidth: 1, borderColor: '#4ADE80', justifyContent: 'center', alignItems: 'center' },
});

export default TransactionReceipt;
