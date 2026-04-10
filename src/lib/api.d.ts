export function getAuthToken(): string | null;
export function getRefreshToken(): string | null;
export function setAuthTokens(accessToken: string | null, refreshToken: string | null): void;
export function setAuthToken(token: string | null): void;
export function applyAuthResponse(
  body: { token?: string; refreshToken?: string } | null | undefined
): boolean;
export function refreshAdminSession(): Promise<boolean>;
export function logoutAdmin(): Promise<void>;
export function request(path: string, options?: RequestInit): Promise<unknown>;

export function getHealth(): Promise<unknown>;
export function getCategories(): Promise<unknown[]>;
export function getMenuItems(categoryId?: string | number | null): Promise<unknown[]>;
export function postReservation(body: Record<string, unknown>): Promise<unknown>;
export function getGallery(): Promise<unknown[]>;

export function login(email: string, password: string): Promise<{ token?: string } & Record<string, unknown>>;
export function register(
  email: string,
  password: string,
  name?: string,
  adminSecret?: string
): Promise<{ token?: string } & Record<string, unknown>>;

export function getAdminMe(): Promise<unknown>;
export function uploadAdminImage(file: File): Promise<{ url?: string } & Record<string, unknown>>;
export function getAdminReservations(): Promise<unknown[]>;
export function getAdminCategories(): Promise<unknown[]>;
export function getAdminMenuItems(categoryId?: string | number | null): Promise<unknown[]>;
export function createAdminCategory(body: Record<string, unknown>): Promise<unknown>;
export function updateAdminCategory(id: string | number, body: Record<string, unknown>): Promise<unknown>;
export function deleteAdminCategory(id: string | number): Promise<unknown>;
export function createAdminMenuItem(body: Record<string, unknown>): Promise<unknown>;
export function updateAdminMenuItem(id: string | number, body: Record<string, unknown>): Promise<unknown>;
export function deleteAdminMenuItem(id: string | number): Promise<unknown>;
export function getAdminGallery(): Promise<unknown[]>;
export function createAdminGalleryImage(body: Record<string, unknown>): Promise<unknown>;
export function deleteAdminGalleryImage(id: string | number): Promise<unknown>;
