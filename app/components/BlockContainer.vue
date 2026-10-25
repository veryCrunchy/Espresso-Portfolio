<script setup lang="ts">
interface BlockContainerProps {
	fullWidth?: boolean;
}

withDefaults(defineProps<BlockContainerProps>(), {
	fullWidth: false,
});
</script>
<template>
	<section :class="['pt-8 py-4 mx-auto', !fullWidth ? 'px-6 lg:px-16 lg:py-16 max-w-6xl' : '']">
		<slot />
	</section>
</template>
