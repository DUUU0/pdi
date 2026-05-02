import { apiClient } from "./api"; 

type LoginCredentials = {
    email: string;
    password: string;
}


type AuthResponse = {
    token: string;
    role: string; 
    username: string;
}

class UserService {

    async login(credentials: LoginCredentials): Promise<AuthResponse | null> {
        try {
            const { data } = await apiClient.post<AuthResponse>("/auth/login", credentials);

            if (data && data.token) {
                sessionStorage.setItem("token", data.token);
                sessionStorage.setItem("role", data.role);
                sessionStorage.setItem("username", data.username);
                return data;
            }
            return null;
        } catch (error) {
            console.error("Falha na autenticação:", error);
            throw error; 
        }
    }

    isAuthenticated(): boolean {
        const token = sessionStorage.getItem("token");
        return !!token && token !== "undefined" && token !== "null";
    }

    isAdmin(): boolean {
        const role = sessionStorage.getItem("role");
        return role === "ROLE_ADMIN" || role === "ADMIN";
    }

    isUser(): boolean {
        const role = sessionStorage.getItem("role");
        return role === "ROLE_USER" || role === "USER";
    }

    getRole(): string | null {
        return sessionStorage.getItem("role");
    }

    getUsername(): string | null {
        return sessionStorage.getItem("username");
    }

    logOut() {
        sessionStorage.clear(); 
        window.location.href = "/login";
    }
}

// Exportamos uma instância única (Singleton) para ser usada em todo o app
export default new UserService();