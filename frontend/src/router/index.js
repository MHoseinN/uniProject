import { createRouter, createWebHistory } from "vue-router";

import Main from "../pages/Main.vue";
import MyPanel from "../pages/MyPanel.vue";
import Reserve from "../pages/Reserve.vue";
import ReserveBasket from "../pages/ReserveBasket.vue";
import Login from "../pages/Login.vue";
import Register from "../pages/Register.vue";
import AdminPanel from "../pages/AdminPanel.vue";
import AboutUs from "../pages/AboutUs.vue";
import Products from "../pages/Products.vue";
import QueueUsers from "../pages/QueueUsers.vue";
import RegisteredUsers from "../pages/RegisteredUsers.vue";
import ReservedLists from "../pages/ReservedLists.vue";
import Factor from "../pages/Factor.vue";
import Income from "../pages/Income.vue";

const routes = [
  { path: "/", component: Main },
  {
    path: "/my-panel",
    component: MyPanel,
    meta: { requiresAuth: true, role: "user" },
  },
  {
    path: "/reserve",
    component: Reserve,
    meta: { requiresAuth: true, role: "user" },
  },
  {
    path: "/basket",
    component: ReserveBasket,
    meta: { requiresAuth: true, role: "user" },
  },
  { path: "/login", component: Login, meta: { requiresGuest: true } },
  { path: "/register", component: Register, meta: { requiresGuest: true } },
  {
    path: "/admin",
    component: AdminPanel,
    meta: { requiresAuth: true, role: "admin" },
  },
  { path: "/about", component: AboutUs },
  {
    path: "/admin/products",
    component: Products,
    meta: { requiresAuth: true, role: "admin" },
  },
  {
    path: "/admin/queue-users",
    component: QueueUsers,
    meta: { requiresAuth: true, role: "admin" },
  },
  {
    path: "/admin/registered-users",
    component: RegisteredUsers,
    meta: { requiresAuth: true, role: "admin" },
  },
  {
    path: "/admin/reserved-lists",
    component: ReservedLists,
    meta: { requiresAuth: true, role: "admin" },
  },
  {
    path: "/factor/:code",
    component: Factor,
    meta: { requiresAuth: true, role: "user" },
  },
  {
    path: "/admin/income",
    component: Income,
    meta: { requiresAuth: true, role: "admin" },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  // Check if route requires authentication
  if (to.meta.requiresAuth && !token) {
    return next("/login");
  }

  // Check if route requires specific role
  if (to.meta.requiresAuth && to.meta.role && role !== to.meta.role) {
    // Redirect based on actual role
    if (role === "admin") {
      return next("/admin");
    } else if (role === "user") {
      return next("/my-panel");
    } else {
      return next("/login");
    }
  }

  // Redirect logged-in users away from guest-only pages
  if (to.meta.requiresGuest && token) {
    if (role === "admin") {
      return next("/admin");
    } else if (role === "user") {
      return next("/my-panel");
    } else {
      return next("/");
    }
  }

  next();
});

export default router;
