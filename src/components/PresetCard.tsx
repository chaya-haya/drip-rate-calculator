import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, spacing, fontSize } from '../constants/theme';
import type { Preset } from '../types';

interface PresetCardProps {
  preset: Preset;
  onSelect: (preset: Preset) => void;
  onEdit: (preset: Preset) => void;
  onDelete: (presetId: string) => void;
}

// プリセットカードコンポーネント
export const PresetCard: React.FC<PresetCardProps> = ({ preset, onSelect, onEdit, onDelete }) => {
  const infusionSetName = preset.infusionSet?.name || '成人用';
  const timeText = `${preset.hours || 0}時間${preset.minutes || 0}分`;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.name} numberOfLines={1}>
          {preset.name}
        </Text>
        <TouchableOpacity onPress={() => onEdit(preset)} style={styles.editButton}>
          <Text style={styles.editText}>編集</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.details}>
        {infusionSetName} / {preset.volume}mL / {timeText}
      </Text>

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.selectButton}
          onPress={() => onSelect(preset)}
          activeOpacity={0.7}
        >
          <Text style={styles.selectButtonText}>この設定を使用</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => onDelete(preset.id)}
          activeOpacity={0.7}
        >
          <Text style={styles.deleteButtonText}>削除</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  name: {
    fontSize: fontSize.medium,
    fontWeight: 'bold',
    color: colors.text,
    flex: 1,
  },
  editButton: {
    padding: spacing.xs,
  },
  editText: {
    fontSize: fontSize.small,
    color: colors.primary,
  },
  details: {
    fontSize: fontSize.small,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  selectButton: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: 8,
    padding: spacing.sm,
    alignItems: 'center',
  },
  selectButtonText: {
    color: colors.textLight,
    fontSize: fontSize.small,
    fontWeight: '600',
  },
  deleteButton: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.error,
    borderRadius: 8,
    padding: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  deleteButtonText: {
    color: colors.error,
    fontSize: fontSize.small,
  },
});
