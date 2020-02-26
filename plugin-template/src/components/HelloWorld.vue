<template>
  <div>
    <p>{{ defaultText }}</p>
  </div>
</template>

<script lang="ts">
export default {
  name: 'HelloWorld',
  mounted() {
    console.log('ok!');
  },
  computed: {
    defaultText() {
      return 1;
    }
  }
};
</script>

<style scoped>
p {
  font-size: 20px;
}
</style>
