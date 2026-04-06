import { create } from 'zustand';
import type { Group, Member } from '../types';
import * as groupsDb from '../db/groups';
import * as membersDb from '../db/members';

interface GroupState {
  groups: Group[];
  isLoaded: boolean;
  loadGroups: () => Promise<void>;
  createGroup: (name: string, emoji: string, memberNames: string[], selfName: string) => Promise<string>;
  updateGroup: (id: string, name: string, emoji: string) => Promise<void>;
  deleteGroup: (id: string) => Promise<void>;
  getGroupMembers: (groupId: string) => Promise<Member[]>;
}

export const useGroupStore = create<GroupState>((set, get) => ({
  groups: [],
  isLoaded: false,
  loadGroups: async () => {
    const groups = await groupsDb.getGroups();
    for (const group of groups) { group.members = await membersDb.getMembersByGroup(group.id); }
    set({ groups, isLoaded: true });
  },
  createGroup: async (name, emoji, memberNames, selfName) => {
    const groupId = await groupsDb.createGroup(name, emoji);
    await membersDb.addMember(groupId, selfName, true);
    for (const memberName of memberNames) { await membersDb.addMember(groupId, memberName, false); }
    await get().loadGroups();
    return groupId;
  },
  updateGroup: async (id, name, emoji) => { await groupsDb.updateGroup(id, name, emoji); await get().loadGroups(); },
  deleteGroup: async (id) => { await groupsDb.deleteGroup(id); await get().loadGroups(); },
  getGroupMembers: async (groupId) => membersDb.getMembersByGroup(groupId),
}));
