export interface UserModel {
  id:            string;
  firstName:     string;
  lastName:      string;
  email:         string;
  avatarUrl?:    string;
  initialAvatar: string;
  isAdmin:       boolean;
  isActive:      boolean;
  lastLogin?:    Date;
  createdAt:     Date;
  isGoogleAccount?: boolean
  phone?:     string;
}
