import { InventoryItem } from '../types';

export interface ExpirationInfo {
  status: 'expired' | 'expiring_today' | 'expiring_soon' | 'normal' | 'none';
  daysLeft: number | null;
  targetDate: string | null;
  label: string;
  isExpired: boolean;
  isExpiringSoon: boolean;
  type: 'expiry' | 'review' | 'none';
}

/**
 * Calculates day difference from today to target date string (YYYY-MM-DD).
 * Negative means in the past (overdue/expired).
 * 0 means today.
 * Positive means in the future.
 */
export function getDaysDifference(targetDateStr?: string): number | null {
  if (!targetDateStr) return null;

  try {
    const parts = targetDateStr.split('-');
    if (parts.length !== 3) return null;

    const targetYear = parseInt(parts[0], 10);
    const targetMonth = parseInt(parts[1], 10) - 1;
    const targetDay = parseInt(parts[2], 10);

    const targetDate = new Date(targetYear, targetMonth, targetDay);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const diffTime = targetDate.getTime() - today.getTime();
    return Math.round(diffTime / (1000 * 60 * 60 * 24));
  } catch {
    return null;
  }
}

/**
 * Evaluates the expiration status of an inventory item.
 * Evaluates expiresAt first, and reviewDate if later_box and no expiresAt.
 */
export function getItemExpirationInfo(item: InventoryItem): ExpirationInfo {
  // Check expiresAt first
  if (item.expiresAt) {
    const days = getDaysDifference(item.expiresAt);
    if (days !== null) {
      if (days < 0) {
        return {
          status: 'expired',
          daysLeft: days,
          targetDate: item.expiresAt,
          label: `已過期 ${Math.abs(days)} 天`,
          isExpired: true,
          isExpiringSoon: false,
          type: 'expiry'
        };
      } else if (days === 0) {
        return {
          status: 'expiring_today',
          daysLeft: 0,
          targetDate: item.expiresAt,
          label: '今天到期！',
          isExpired: true,
          isExpiringSoon: true,
          type: 'expiry'
        };
      } else if (days <= 30) {
        return {
          status: 'expiring_soon',
          daysLeft: days,
          targetDate: item.expiresAt,
          label: `剩餘 ${days} 天到期`,
          isExpired: false,
          isExpiringSoon: true,
          type: 'expiry'
        };
      } else {
        return {
          status: 'normal',
          daysLeft: days,
          targetDate: item.expiresAt,
          label: `效期至 ${item.expiresAt} (${days} 天後)`,
          isExpired: false,
          isExpiringSoon: false,
          type: 'expiry'
        };
      }
    }
  }

  // Check reviewDate for later_box items
  if (item.reviewDate) {
    const days = getDaysDifference(item.reviewDate);
    if (days !== null) {
      if (days < 0) {
        return {
          status: 'expired',
          daysLeft: days,
          targetDate: item.reviewDate,
          label: `猶豫箱已逾期 ${Math.abs(days)} 天待檢驗`,
          isExpired: true,
          isExpiringSoon: false,
          type: 'review'
        };
      } else if (days === 0) {
        return {
          status: 'expiring_today',
          daysLeft: 0,
          targetDate: item.reviewDate,
          label: '猶豫箱今天應進行檢驗！',
          isExpired: true,
          isExpiringSoon: true,
          type: 'review'
        };
      } else if (days <= 30) {
        return {
          status: 'expiring_soon',
          daysLeft: days,
          targetDate: item.reviewDate,
          label: `猶豫箱剩餘 ${days} 天待檢驗`,
          isExpired: false,
          isExpiringSoon: true,
          type: 'review'
        };
      } else {
        return {
          status: 'normal',
          daysLeft: days,
          targetDate: item.reviewDate,
          label: `猶豫箱檢驗日 ${item.reviewDate}`,
          isExpired: false,
          isExpiringSoon: false,
          type: 'review'
        };
      }
    }
  }

  return {
    status: 'none',
    daysLeft: null,
    targetDate: null,
    label: '',
    isExpired: false,
    isExpiringSoon: false,
    type: 'none'
  };
}

export interface ExpirationSummary {
  expiredCount: number;
  expiringSoonCount: number;
  totalAlertCount: number;
  expiredItems: { item: InventoryItem; info: ExpirationInfo }[];
  expiringSoonItems: { item: InventoryItem; info: ExpirationInfo }[];
  allAlertItems: { item: InventoryItem; info: ExpirationInfo }[];
}

/**
 * Scans the full item list and computes expiration summary and lists.
 */
export function scanItemsExpiration(items: InventoryItem[]): ExpirationSummary {
  const expiredItems: { item: InventoryItem; info: ExpirationInfo }[] = [];
  const expiringSoonItems: { item: InventoryItem; info: ExpirationInfo }[] = [];

  for (const item of items) {
    const info = getItemExpirationInfo(item);
    if (info.isExpired) {
      expiredItems.push({ item, info });
    } else if (info.isExpiringSoon) {
      expiringSoonItems.push({ item, info });
    }
  }

  // Sort expired items by most overdue first (lowest negative days)
  expiredItems.sort((a, b) => (a.info.daysLeft || 0) - (b.info.daysLeft || 0));

  // Sort expiring soon items by closest to expire first (lowest positive days)
  expiringSoonItems.sort((a, b) => (a.info.daysLeft || 0) - (b.info.daysLeft || 0));

  const allAlertItems = [...expiredItems, ...expiringSoonItems];

  return {
    expiredCount: expiredItems.length,
    expiringSoonCount: expiringSoonItems.length,
    totalAlertCount: expiredItems.length + expiringSoonItems.length,
    expiredItems,
    expiringSoonItems,
    allAlertItems
  };
}
