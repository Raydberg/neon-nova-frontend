export interface UserProfile {
  id:         string;
  email:      string;
  name:       string;
  firstName:  string;
  lastName:   string;
  avatarUrl:  string;
  initials:   string;
  permission: Permission;
}

export interface Permission {
  admin: boolean;
  user:  boolean;
}
