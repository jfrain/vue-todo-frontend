import Vue from "vue";
import "./plugins/vuetify.js";
import VueRouter from "vue-router";

import axios from "axios";

import store from "./stores/store";

import App from "./App.vue";
import Login from "./components/Auth/Login";
import Signup from "./components/Auth/Signup";
import Todo from "./components/Todo";
import Tasks from "./components/Tasks";
import NotesModal from "./components/NotesModal";

Vue.config.productionTip = false;

Vue.use(VueRouter);

axios.defaults.baseURL = "http://localhost:8000/api/";
axios.defaults.withCredentials = true;

const routes = [
  {
    path: "/",
    component: Todo,
    name: "todo",
    children: [
      {
        path: "list/:id",
        components: { tasks: Tasks },
        name: "tasks",
        children: [
          {
            path: "task/:taskId",
            components: { notes: NotesModal },
            name: "notes"
          }
        ]
      }
    ]
  },
  {
    path: "/login",
    component: Login,
    name: "login"
  },
  {
    path: "/signup",
    component: Signup,
    name: "signup"
  }
];

let isRefreshing = false;
let subscribers = [];

axios.interceptors.response.use(
  response => {
    return response;
  },
  err => {
    const {
      config,
      response: { status, data }
    } = err;

    const originalRequest = config;

    if (status === 401) {
      if (!isRefreshing) {
        isRefreshing = true;
        store
          .dispatch("REFRESH_TOKEN")
          .then(({ status }) => {
            if (status === 200 || status == 204) {
              isRefreshing = false;
            }
            subscribers = [];
          })
          .catch(error => {
            console.error(error);
          });
      }

    }
  }
);

function subscribeTokenRefresh(cb) {
  subscribers.push(cb);
}

function onRefreshed() {
  subscribers.map(cb => cb());
}

subscribers = [];

const router = new VueRouter({
  mode: "history",
  routes,
  base: "/"
});

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount("#app");
