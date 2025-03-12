import { useTheme } from "context";
import { useMemo } from "react";
import { StyleSheet, View } from "react-native";

const SkeletonLoader = ({ count }: { count: number }) => {
    const styles = useStyles();
    const MAX_VISIBLE_ITEMS = 3;
    return (
      <View>
        {Array.from({ length: Math.min(count, MAX_VISIBLE_ITEMS) }).map((_, index) => (
          <View key={index} style={styles.skeletonItem}>
            <View style={styles.skeletonTime} />
            <View style={styles.skeletonTitle} />
          </View>
        ))}
      </View>
    );
};

const useStyles = () => {
    const { Colors } = useTheme();
    return useMemo(() => StyleSheet.create({
        skeletonItem: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: 8,
            paddingHorizontal: 10,
          },
          skeletonTime: {
            width: 60,
            height: 16,
            backgroundColor: '#e0e0e0',
            borderRadius: 4,
            marginRight: 10,
          },
          skeletonTitle: {
            flex: 1,
            height: 16,
            backgroundColor: '#e0e0e0',
            borderRadius: 4,
          },
    }), [Colors])
}

export default SkeletonLoader;