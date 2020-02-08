<template>
  <div>
    <b-alert v-model="showDismissibleAlert" variant="success" dismissible>{{ message }}</b-alert>
  </div>
</template>

<script>
export default {
  data() {
    return {
      showDismissibleAlert: true,
    };
  },
  props: ['message'],
};
</script>
