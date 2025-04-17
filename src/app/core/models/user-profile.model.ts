export interface UserProfile {
  id:        string;
  email:     string;
  name:      string;
  firstName: string;
  lastName:  string;
  permition: Permition;
}

export interface Permition {
  admin: boolean;
  user:  boolean;
}
