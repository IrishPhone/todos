<template>
  <div class="container">
    <div class="col-sm-10">
      <h1>Задачи</h1>
      <p class="text-left">
        Выполнено
        <b-badge variant="info">{{ todosCompleted }}</b-badge>
        , не выполнено
        <b-badge variant="warning">{{ todosUncompleted }}</b-badge>
      </p>
      <b-alert
      :show="dismissCountDown"
      fade
      variant="danger"
      @dismissed="dismissCountDown=0"
      @dismiss-count-down="countDownChanged">
        Ошибка передачи данных ({{ dismissCountDown }})
      </b-alert>
      <confirmation
        :message="confirmationMessage"
        v-if="confirmationMessage">
      </confirmation>
      <button type="button"
        id="task-add"
        class="btn btn-success btn-sm align-left d-block"
        @click="showDismissibleAlert=true"
        v-b-modal.todo-modal>
          Добавить задачу
      </button>

      <table class="table table-dark table-stripped table-hover">
        <thead class="thead-light">
          <tr>
            <th>Uid</th>
            <th>Описание</th>
            <th>Выполнена?</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(todo, index) in todos" :key="index">
            <td class="todo-uid">{{ todo.uid }}</td>
            <td>{{ todo.description }}</td>
            <td>
              <span v-if="todo.is_completed">Выполнена</span>
              <span v-else>Не выполнена</span>
            </td>
            <td>
              <div class="btn-group" role="group">
                <button type="button"
                  class="btn btn-secondary btn-sm"
                  v-b-modal.todo-update-modal
                  @click="updateTodo(todo); showDismissibleAlert=true">
                  Обновить
                </button>
                &nbsp;
                <button type="button" @click="deleteTodo(todo); showDismissibleAlert=true"
                class="btn btn-danger btn-sm">
                  X
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <b-modal ref="addTodoModal"
         id="todo-modal"
         title="Добавить задачу"
         hide-footer>
      <b-form @submit="onSubmit" @reset="onReset" class="w-100">
        <b-form-group id="form-description-group"
                      label="Описание:"
                      label-for="form-description-input">
          <b-form-input id="form-description-input"
                        type="text"
                        v-model="addTodoForm.description"
                        required
                        placeholder="Завести задачу">
          </b-form-input>
        </b-form-group>
        <b-form-group id="form-complete-group">
          <b-form-checkbox-group v-model="addTodoForm.is_completed" id="form-checks">
            <b-form-checkbox value="true">Задача выполнена?</b-form-checkbox>
          </b-form-checkbox-group>
        </b-form-group>
        <b-button type="submit" variant="primary">Добавить</b-button>
        <b-button type="reset" variant="danger">Сброс</b-button>
      </b-form>
    </b-modal>
    <b-modal ref="updateTodoModal"
      id="todo-update-modal"
      title="Изменение задачи"
      hide-footer>
      <b-form @submit="onUpdateSubmit" @reset="onUpdateReset" class="w-100">
        <b-form-group id="form-update-description-group"
                label="Описание:"
                label-for="form-update-description-input">
          <b-form-input id="form-update-description-input"
                  type="text"
                  v-model="updateTodoForm.description"
                  required>
          </b-form-input>
        </b-form-group>
        <b-form-group id="form-update-complete-group">
          <b-form-checkbox-group v-model="updateTodoForm.is_completed" id="form-update-checks">
            <b-form-checkbox value="true">Задача выполнена?</b-form-checkbox>
          </b-form-checkbox-group>
        </b-form-group>
        <b-button-group>
          <b-button type="submit" variant="primary">Обновить</b-button>
          <b-button type="reset" variant="danger">Сброс</b-button>
        </b-button-group>
      </b-form>
    </b-modal>

  </div>
</template>

<script>
import axios from 'axios';
import Confirmation from './Confirmation.vue';

const todoListURL = 'http://localhost:5000/api/tasks/';
const todoAddURL = 'http://localhost:5000/api/tasks/';
const dataURL = 'http://localhost:5000/api/tasks/';

export default {
  name: 'Todo',
  data() {
    return {
      todos: [],
      addTodoForm: {
        description: '',
        is_completed: [],
      },
      updateTodoForm: {
        uid: 0,
        description: '',
        is_completed: [],
      },
      confirmationMessage: '',
      showConfirmation: true,
      showDismissibleAlert: true,
      dismissSecs: 5,
      dismissCountDown: 0,
      todosCompleted: 0,
      todosUncompleted: 0,
    };
  },
  methods: {
    getTodos() {
      axios.get(todoListURL)
        .then((response) => {
          this.todos = response.data.tasks;
          localStorage.setItem('tasks', JSON.stringify(this.todos));
        })
        .catch(() => {
          this.countDownChanged(5);
          this.showAlert();
          if (localStorage.getItem('tasks')) {
            this.todos = JSON.parse(localStorage.getItem('tasks'));
          } else {
            localStorage.setItem('tasks', '');
          }
        })
        .finally(() => {
          this.todosCompleted = (this.todos.filter(value => value.is_completed)).length;
          this.todosUncompleted = this.todos.length - this.todosCompleted;
          this.fixUids();
        });
    },
    resetForm() {
      this.addTodoForm.description = '';
      this.addTodoForm.is_completed = [];
      this.updateTodoForm.description = '';
      this.updateTodoForm.is_completed = [];
    },
    onSubmit(event) {
      event.preventDefault();
      this.$refs.addTodoModal.hide();
      // if (this.addTodoForm.is_completed[0] !== true) {
      //   this.addTodoForm.is_completed[0] = false;
      // }
      const requestData = {
        description: this.addTodoForm.description,
        is_completed: this.addTodoForm.is_completed[0],
      };
      axios.post(todoAddURL, requestData)
        .then(() => {
          this.getTodos();
          this.confirmationMessage = `Задача "${requestData.description}" добавлена`;
          this.showConfirmation = true;
          this.showDismissibleAlert = true;
          this.resetForm();
        })
        .catch(() => {
          this.countDownChanged(5);
          this.showAlert();
          const newLSData = {
            description: this.addTodoForm.description,
            is_completed: Boolean(this.addTodoForm.is_completed[0]),
            uid: this.todos.length + 1,
          };
          this.todos.push(newLSData);
          localStorage.setItem('tasks', JSON.stringify(this.todos));
          this.resetForm();
          this.getTodos();
        });
    },
    onReset(event) {
      event.preventDefault();
      this.$refs.addTodoModal.hide();
      this.resetForm();
    },
    updateTodo(todo) {
      this.updateTodoForm = todo;
      this.showDismissibleAlert = true;
    },
    onUpdateSubmit(event) {
      event.preventDefault();
      this.$refs.updateTodoModal.hide();
      const requestData = {
        description: this.updateTodoForm.description,
        is_completed: this.updateTodoForm.is_completed,
      };
      const todoURL = dataURL + this.updateTodoForm.uid;
      axios.put(todoURL, requestData)
        .then(() => {
          this.getTodos();
          this.confirmationMessage = `Задача "${requestData.description}" обновлена`;
          this.showConfirmation = true;
          this.showDismissibleAlert = true;
        })
        .catch(() => {
          this.todos = this.todos.map((val) => {
            let tmp = val;
            if (tmp.uid === this.updateTodoForm.uid) {
              const taskData = {
                description: this.updateTodoForm.description,
                is_completed: Boolean(this.updateTodoForm.is_completed[0]),
                uid: this.updateTodoForm.uid,
              };
              tmp = taskData;
            }
            return tmp;
          });
          localStorage.setItem('tasks', JSON.stringify(this.todos));
          this.confirmationMessage = `Задача "${requestData.description}" обновлена локально`;
          this.showConfirmation = true;
          this.showDismissibleAlert = true;
          this.countDownChanged(5);
          this.showAlert();
          this.getTodos();
        });
    },
    onUpdateReset(event) {
      event.preventDefault();
      this.$refs.updateTodoModal.hide();
      this.resetForm();
    },
    deleteTodo(todo) {
      const todoURL = dataURL + todo.uid;
      this.getTodos();
      axios.delete(todoURL)
        .then(() => {
          this.confirmationMessage = 'Задача удалена из списка';
          this.showConfirmation = true;
          this.showDismissibleAlert = true;
        })
        .catch(() => {
          this.countDownChanged(5);
          this.showAlert();
          this.confirmationMessage = 'Задача удалена из списка (локально)';
          this.showConfirmation = true;
          this.showDismissibleAlert = true;
          this.todos = this.todos.filter(val => val.uid !== todo.uid);
          localStorage.setItem('tasks', JSON.stringify(this.todos));
          this.getTodos();
        });
    },
    fixUids() {
      const tds = this.todos.map((v, i) => {
        const tmpv = v;
        tmpv.uid = i + 1;
        return tmpv;
      });
      this.todos = tds;
    },
    countDownChanged(dismissCountDown) {
      this.dismissCountDown = dismissCountDown;
    },
    showAlert() {
      this.dismissCountDown = this.dismissSecs;
    },
  },
  components: {
    confirmation: Confirmation,
  },
  created() {
    this.getTodos();
  },
};
</script>

<style>
button#task-add {
  margin-top: 20px;
  margin-bottom: 20px;
}
h1, td {
  text-align: left;
}
.todo-uid {
  text-align: right;
}
</style>
