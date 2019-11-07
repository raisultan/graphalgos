<template>
    <div id="app">
        <header>
            <div class="header-wrapper">
                <nav>
                    <router-link to="/search">1.breadth first search</router-link>
                    <router-link to="/dijkstra">2.dijkstra's algorithm</router-link>
                    <router-link to="/buildtree">3.build MST</router-link>
                </nav>
            </div>
        </header>

        <router-view>

        </router-view>
    </div>
</template>

<style scoped>

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  padding: 0;
  font-family: Cambria, Calibri, Arial, sans-serif;
  padding-bottom: 80px;
}

a {
  color: inherit;
  text-decoration: none;
}

img {
  max-width: 100%;
}

header {
  height: 80px;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  background-color:whitesmoke;
  opacity: 0.8;
}

.header-wrapper {
  max-width: 800px;
  margin: 0 auto;
  padding: 18px 30px 20px;
}

nav {
  font-family: 'axis';
  font-size: 15px;
  padding: 10px 0 14px;
  height: 40px;
  font-weight: 500;
}

nav a {
  margin: 0 26px 0 0;
  color:black;
}

nav a.router-link-active {
  color: green;
}

.grey {
  color: rgba(187, 187, 187, 1);
}

</style>
