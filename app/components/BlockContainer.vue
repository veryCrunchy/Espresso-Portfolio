<script setup lang="ts">
interface BlockContainerProps {
	fullWidth?: boolean;
}

withDefaults(defineProps<BlockContainerProps>(), {
	fullWidth: false,
});
</script>
<template>
	<section :class="['mx-auto py-6 lg:py-10', !fullWidth && 'max-w-content px-4 sm:px-6 lg:px-12']">
		<slot />
	</section>
</template>
