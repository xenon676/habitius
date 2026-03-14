import axios from 'axios';
import { API_ENDPOINTS } from './config';
import type { HabitData, DailyData, TodoData } from '../types/task';
import { InventorySection, InventoryItem } from '../types/inventory';

export const getHabits = async (): Promise<HabitData[]> => {
    const response = await axios.get(API_ENDPOINTS.tasks.habits);
    return response.data;
};

export const getDailies = async (): Promise<DailyData[]> => {
    const response = await axios.get(API_ENDPOINTS.tasks.dailies);
    return response.data;
};

export const getTodos = async (): Promise<TodoData[]> => {
    const response = await axios.get(API_ENDPOINTS.tasks.todos);
    return response.data;
};

export const createHabit = async (habit: Partial<HabitData>): Promise<HabitData> => {
    const response = await axios.post(API_ENDPOINTS.tasks.habits, habit);
    return response.data;
};

export const createDaily = async (daily: Partial<DailyData>): Promise<DailyData> => {
    const response = await axios.post(API_ENDPOINTS.tasks.dailies, daily);
    return response.data;
};

export const createTodo = async (todo: Partial<TodoData>): Promise<TodoData> => {
    const response = await axios.post(API_ENDPOINTS.tasks.todos, todo);
    return response.data;
};

export const updateHabit = async (id: string, habit: Partial<HabitData>): Promise<HabitData> => {
    const response = await axios.put(API_ENDPOINTS.tasks.habit(id), habit);
    return response.data;
};

export const updateDaily = async (id: string, daily: Partial<DailyData>): Promise<DailyData> => {
    const response = await axios.put(API_ENDPOINTS.tasks.daily(id), daily);
    return response.data;
};

export const updateTodo = async (id: string, todo: Partial<TodoData>): Promise<TodoData> => {
    const response = await axios.put(API_ENDPOINTS.tasks.todo(id), todo);
    return response.data;
};

export const updateHabitPosition = async (id: string, position: number) => {
  const response = await axios.patch(API_ENDPOINTS.tasks.habitPosition(id), { position });
  return response.data;
}

export const updateDailyPosition = async (id: string, position: number) => {
  const response = await axios.patch(API_ENDPOINTS.tasks.dailyPosition(id), { position });
  return response.data;
}

export const updateTodoPosition = async (id: string, position: number) => {
  const response = await axios.patch(API_ENDPOINTS.tasks.todoPosition(id), { position });
  return response.data;
}

export const deleteHabit = async (id: string): Promise<void> => {
    await axios.delete(API_ENDPOINTS.tasks.habit(id));
};

export const deleteDaily = async (id: string): Promise<void> => {
    await axios.delete(API_ENDPOINTS.tasks.daily(id));
};

export const deleteTodo = async (id: string): Promise<void> => {
    await axios.delete(API_ENDPOINTS.tasks.todo(id));
};

export const incrementHabit = async (id: string, isPositive: boolean): Promise<HabitData> => {
    const response = await axios.post(API_ENDPOINTS.tasks.habitIncrement(id), null, {
        params: { is_positive: isPositive }
    });
    return response.data;
};

export const completeDaily = async (id: string): Promise<DailyData> => {
    const response = await axios.post(`${API_ENDPOINTS.tasks.daily(id)}/complete`);
    return response.data;
};

export const completeTodo = async (id: string): Promise<TodoData> => {
    const response = await axios.post(`${API_ENDPOINTS.tasks.todo(id)}/complete`);
    return response.data;
};

// Inventory endpoints
export const getInventory = async (): Promise<InventorySection[]> => {
  const response = await axios.get(API_ENDPOINTS.inventory.items);
  return response.data;
};

export const getSectionItems = async (section: string): Promise<InventorySection> => {
  const response = await axios.get(API_ENDPOINTS.inventory.section(section));
  return response.data;
};

export const useItem = async (itemId: string, targetId?: string): Promise<InventoryItem> => {
  const response = await axios.post(API_ENDPOINTS.inventory.useItem(itemId), { target_id: targetId });
  return response.data;
};

export const getItemDefinitions = async (type?: string) => {
  const response = await axios.get(`${API_ENDPOINTS.inventory.definitions}${type ? `?type=${type}` : ''}`);
  return response.data;
};

export const updateCronTime = async (cronTime: number): Promise<void> => {
  const response = await axios.put(API_ENDPOINTS.cron.time, { cron_time: cronTime });
  return response.data;
};