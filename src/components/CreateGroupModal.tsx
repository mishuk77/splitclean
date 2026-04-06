import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  useColorScheme,
} from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';

import { useGroupStore } from '../store/useGroupStore';
import { useSettingsStore } from '../store/useSettingsStore';
import { Colors } from '../constants/colors';
import { GROUP_EMOJIS } from '../constants/categories';

interface Props {
  visible: boolean;
  onClose: () => void;
}

export default function CreateGroupModal({ visible, onClose }: Props) {
  const theme = useSettingsStore((s) => s.settings.theme);
  const selfName = useSettingsStore((s) => s.settings.self_name);
  const createGroup = useGroupStore((s) => s.createGroup);
  const systemTheme = useColorScheme();
  const isDark = theme === 'dark' || (theme === 'system' && systemTheme !== 'light');
  const colors = isDark ? Colors.dark : Colors.light;

  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState('🏠');
  const [memberName, setMemberName] = useState('');
  const [members, setMembers] = useState<string[]>([]);

  const reset = () => {
    setName('');
    setEmoji('🏠');
    setMemberName('');
    setMembers([]);
  };

  const handleAddMember = () => {
    const trimmed = memberName.trim();
    if (trimmed && !members.includes(trimmed)) {
      setMembers([...members, trimmed]);
      setMemberName('');
    }
  };

  const handleRemoveMember = (index: number) => {
    setMembers(members.filter((_, i) => i !== index));
  };

  const handleCreate = async () => {
    const trimmedName = name.trim();
    if (!trimmedName || members.length === 0) return;
    await createGroup(trimmedName, emoji, members, selfName);
    reset();
    onClose();
  };

  const canCreate = name.trim().length > 0 && members.length > 0;

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={[styles.sheet, { backgroundColor: colors.card }]}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.textPrimary }]}>New Group</Text>
            <TouchableOpacity onPress={() => { reset(); onClose(); }}>
              <FontAwesome name="times" size={22} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Emoji Picker */}
          <View style={styles.emojiRow}>
            {GROUP_EMOJIS.map((e) => (
              <TouchableOpacity
                key={e}
                style={[
                  styles.emojiButton,
                  {
                    backgroundColor: emoji === e ? colors.accent + '30' : 'transparent',
                    borderColor: emoji === e ? colors.accent : 'transparent',
                  },
                ]}
                onPress={() => setEmoji(e)}
              >
                <Text style={styles.emojiText}>{e}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Group Name */}
          <TextInput
            style={[
              styles.input,
              { backgroundColor: colors.inputBackground, color: colors.textPrimary, borderColor: colors.border },
            ]}
            placeholder="Group name"
            placeholderTextColor={colors.textSecondary}
            value={name}
            onChangeText={setName}
            autoFocus
          />

          {/* Add Member */}
          <View style={styles.addMemberRow}>
            <TextInput
              style={[
                styles.input,
                { flex: 1, backgroundColor: colors.inputBackground, color: colors.textPrimary, borderColor: colors.border },
              ]}
              placeholder="Add member name"
              placeholderTextColor={colors.textSecondary}
              value={memberName}
              onChangeText={setMemberName}
              onSubmitEditing={handleAddMember}
              returnKeyType="done"
            />
            <TouchableOpacity
              style={[styles.addButton, { backgroundColor: colors.accent }]}
              onPress={handleAddMember}
            >
              <FontAwesome name="plus" size={16} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {/* Member List */}
          <View style={styles.memberList}>
            <View style={[styles.memberChip, { backgroundColor: colors.accent + '20', borderColor: colors.accent }]}>
              <Text style={[styles.memberText, { color: colors.accent }]}>
                {selfName} (You)
              </Text>
            </View>
            {members.map((m, i) => (
              <View key={i} style={[styles.memberChip, { backgroundColor: colors.inputBackground, borderColor: colors.border }]}>
                <Text style={[styles.memberText, { color: colors.textPrimary }]}>{m}</Text>
                <TouchableOpacity onPress={() => handleRemoveMember(i)} style={styles.removeButton}>
                  <FontAwesome name="times" size={12} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>
            ))}
          </View>

          {/* Create Button */}
          <TouchableOpacity
            style={[
              styles.createButton,
              { backgroundColor: canCreate ? colors.accent : colors.border },
            ]}
            onPress={handleCreate}
            disabled={!canCreate}
          >
            <Text style={[styles.createButtonText, { color: canCreate ? '#FFFFFF' : colors.textSecondary }]}>
              Create Group
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  sheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 40,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
  },
  emojiRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  emojiButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
  },
  emojiText: {
    fontSize: 24,
  },
  input: {
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 12,
  },
  addMemberRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 1,
  },
  memberList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  memberChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    gap: 6,
  },
  memberText: {
    fontSize: 14,
    fontWeight: '500',
  },
  removeButton: {
    padding: 2,
  },
  createButton: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  createButtonText: {
    fontSize: 17,
    fontWeight: '700',
  },
});
