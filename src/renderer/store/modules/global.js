import { Storage } from '@/common/utils'
import { get, patch } from '@/common/fetch'

const token = new Storage('TOKEN')
const PAGE_SIZE = 100
// const BASE_URL = 'https://graph.microsoft.com/beta'

const state = {
  userPhoto: null,
  hasLogin: true,
  token: token.get({}),
  taskFolders: [],
  currentFolder: {},
  sort: false,
  tasks: [],
  currentTask: {},
  showCompleteTask: true,
  showTaskDetailModel: false,
  showTaskAddModel: false,
  showTaskFolderAddModel: false,
  showSettingsModel: false,
  showImportanceFolder: true,
  showScheduleFolder: true
}

const getters = {
  tasks ({sort, tasks, currentFolder, showCompleteTask}) {
    let taskArr = [...tasks]
    if (!sort) taskArr = [...tasks].reverse()
    if (currentFolder.Key) {
      taskArr = taskArr.filter(o => o[currentFolder.Key] === currentFolder.Value)
    } else {
      taskArr = taskArr.filter(o => o.ParentFolderId === currentFolder.Id)
    }
    if (!showCompleteTask) {
      taskArr = taskArr.filter(o => o.Status !== 'Completed')
    }
    return taskArr
  }
}

const mutations = {
  UPDATE_STATE (state, data) {
    if (data.token) {
      token.set(data.token)
    }
    Object.assign(state, data)
  }
}

const actions = {
  async GET_USER_PHOTO ({commit}) {
    const { value } = await get('/me/photo')
    console.log(value)
  },
  async GET_TASK_FOLDERS ({commit}) {
    const { value } = await get(`/me/taskfolders?$top=${PAGE_SIZE}`, null, {showLoading: false})
    const currentFolder = value.find(o => o.IsDefaultFolder)
    commit('UPDATE_STATE', {taskFolders: value, currentFolder})
  },
  async GET_TASKS ({commit}) {
    const { value } = await get(`/me/tasks?$top=${PAGE_SIZE}`, null, {showLoading: false})
    commit('UPDATE_STATE', {tasks: value.reverse()})
  },
  async UPDATE_TASK ({state, commit}, data) {
    const newTask = await patch(`/me/tasks/${data.Id}`, data)
    const newState = {tasks: [...state.tasks]}
    const taskIndex = state.tasks.findIndex(o => o.Id === data.Id)
    newState.tasks[taskIndex] = newTask
    if (state.showTaskDetailModel) {
      newState.currentTask = newTask
    }
    commit('UPDATE_STATE', newState)
  }
}

export default {
  state,
  mutations,
  actions,
  getters
}
