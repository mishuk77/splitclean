import React, { useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import ViewShot from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';

import { formatCurrency } from '../utils/format';

interface ShareCardProps {
  groupEmoji: string;
  groupName: string;
  description: string;
  amount: number;
  currency: string;
  paidByName: string;
  splits: { name: string; amount: number }[];
  onClose: () => void;
}

export default function ShareCard({
  groupEmoji,
  groupName,
  description,
  amount,
  currency,
  paidByName,
  splits,
  onClose,
}: ShareCardProps) {
  const viewShotRef = useRef<ViewShot>(null);

  const handleShare = async () => {
    try {
      if (!viewShotRef.current?.capture) return;
      const uri = await viewShotRef.current.capture();
      const isAvailable = await Sharing.isAvailableAsync();
      if (isAvailable) {
        await Sharing.shareAsync(uri, {
          mimeType: 'image/png',
          dialogTitle: 'Share expense',
        });
      }
    } catch (e) {
      console.error('Share failed:', e);
    }
    onClose();
  };

  return (
    <View style={styles.overlay}>
      <ViewShot ref={viewShotRef} options={{ format: 'png', quality: 1 }}>
        <View style={styles.card}>
          <Text style={styles.groupInfo}>
            {groupEmoji} {groupName}
          </Text>
          <Text style={styles.description}>{description}</Text>
          <Text style={styles.amount}>{formatCurrency(amount, currency)}</Text>
          <Text style={styles.paidBy}>Paid by {paidByName}</Text>
          <View style={styles.divider} />
          {splits.map((s, i) => (
            <View key={i} style={styles.splitRow}>
              <Text style={styles.splitName}>{s.name}</Text>
              <Text style={styles.splitAmount}>{formatCurrency(s.amount, currency)}</Text>
            </View>
          ))}
          <View style={styles.divider} />
          <Text style={styles.footer}>via SplitClean</Text>
        </View>
      </ViewShot>

      <View style={styles.buttons}>
        <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
          <Text style={styles.shareButtonText}>Send to group</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
          <Text style={styles.cancelButtonText}>Close</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: '#1A1A24',
    borderRadius: 16,
    padding: 24,
    width: 300,
  },
  groupInfo: {
    fontSize: 15,
    color: '#94A3B8',
    marginBottom: 8,
  },
  description: {
    fontSize: 20,
    fontWeight: '700',
    color: '#F8FAFC',
    marginBottom: 4,
  },
  amount: {
    fontSize: 32,
    fontWeight: '700',
    color: '#F8FAFC',
    marginBottom: 4,
  },
  paidBy: {
    fontSize: 14,
    color: '#94A3B8',
    marginBottom: 16,
  },
  divider: {
    height: 1,
    backgroundColor: '#2A2A3A',
    marginVertical: 12,
  },
  splitRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  splitName: {
    fontSize: 15,
    color: '#F8FAFC',
  },
  splitAmount: {
    fontSize: 15,
    fontWeight: '600',
    color: '#F59E0B',
  },
  footer: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
  },
  buttons: {
    marginTop: 16,
    width: 300,
    gap: 8,
  },
  shareButton: {
    backgroundColor: '#6366F1',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  shareButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#94A3B8',
    fontSize: 15,
  },
});
