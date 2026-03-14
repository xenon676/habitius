// API base URL
export const API_BASE_URL = 'http://localhost:8000';

// API endpoints
export const API_ENDPOINTS = {
    tasks: {
        todos: `${API_BASE_URL}/todos`,
        todo: (id: string) => `${API_BASE_URL}/todos/${id}`,
        habits: `${API_BASE_URL}/habits`,
        habit: (id: string) => `${API_BASE_URL}/habits/${id}`,
        habitIncrement: (id: string) => `${API_BASE_URL}/habits/${id}/increment`,
        dailies: `${API_BASE_URL}/dailies`,
        daily: (id: string) => `${API_BASE_URL}/dailies/${id}`,
        habitPosition: (id: string) => `${API_BASE_URL}/habits/${id}/position`,
        dailyPosition: (id: string) => `${API_BASE_URL}/dailies/${id}/position`,
        todoPosition: (id: string) => `${API_BASE_URL}/todos/${id}/position`,
    },
    inventory: {
        items: `${API_BASE_URL}/inventory/items`,
        definitions: `${API_BASE_URL}/inventory/definitions`,
        useItem: (id: string) => `${API_BASE_URL}/inventory/items/use/${id}`,
        section: (section: string) => `${API_BASE_URL}/inventory/items/${section}`,
    },
    cron: {
        trigger: `${API_BASE_URL}/cron/trigger`,
        time: `${API_BASE_URL}/users/me/cron-time`
    }
}; 