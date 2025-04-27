export interface UserProfile {
  id:         string;
  email:      string;
  name:       string;
  firstName:  string;
  lastName:   string;
  avatarUrl?:  string;
  initials:   string;
  phone?:     string;
  permission: Permission;
}

export interface Permission {
  admin: boolean;
  user:  boolean;
}
