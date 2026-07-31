import useNotification from './hooks/useNotification'
import Notification from './Notification.vue'
import NotificationList from './NotificationList.vue'
import {
  useNotificationContext,
  useNotificationProvider,
} from './NotificationProvider'

export type * from './interface'

export {
  useNotification,
  Notification,
  NotificationList,
  useNotificationContext,
  useNotificationProvider,
}

export type { NotificationAPI } from './hooks/useNotification'

export default useNotification
