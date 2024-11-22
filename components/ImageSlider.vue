<script setup lang="ts">
  import { animate } from "motion";
  const scrollRef = ref<HTMLElement>();

  onMounted(() => {
    if (scrollRef.value) {
      console.log(scrollRef.value.offsetWidth);
      const children = Array.from(scrollRef.value.children);
      children.forEach((child) => {
        const newChild: Element = child.cloneNode(true) as Element;
        newChild.setAttribute("aria-hidden", "true");
        scrollRef.value?.appendChild(newChild);
      });
      const animation = animate(
        scrollRef.value,
        {
          transform: `translateX(-50%)`,
        },
        {
          duration: children.length * 3,
          repeat: Infinity,
          ease: "linear",
        }
      );

      let interval: NodeJS.Timeout;
      const [min, max, transitionSpeed] = [0.2, 1, 15];

      const onup = () => {
        animation.play();
      };
      const ondown = (ev: PointerEvent | MouseEvent) => {
        animation.pause();
      };

      window.onpointerup = onup;
      window.onmouseup = onup;
      scrollRef.value.onpointerdown = ondown;
      scrollRef.value.onmousedown = ondown;
      scrollRef.value.onmouseover = () => {
        clearInterval(interval);
        interval = setInterval(() => {
          animation.speed = Math.max(
            animation.speed - transitionSpeed * 0.005,
            min
          );
          console.log(animation.speed);
          if (animation.speed == min) clearInterval(interval);
        }, 50);
      };
      scrollRef.value.onmouseleave = () => {
        clearInterval(interval);

        interval = setInterval(() => {
          animation.speed = Math.min(
            animation.speed + transitionSpeed * 0.005,
            max
          );
          if (animation.speed == max) clearInterval(interval);

          console.log(animation.speed);
        }, 50);
      };
    }
  });
  const offset = (arr: Array<string>, offset: number) => [
    ...arr.slice(offset),
    ...arr.slice(0, offset),
  ];
  let images = [
    "https://static.wixstatic.com/media/98e591_4cd216e8049144ddb0693316ca0a6733~mv2.png/v1/fill/w_266,h_473,al_c,q_80,usm_0.66_1.00_0.01/98e591_4cd216e8049144ddb0693316ca0a6733~mv2.png",
    "https://static.wixstatic.com/media/98e591_4c25f68e03d04271889c8d7fb6f960a1~mv2.png/v1/fill/w_701,h_473,al_c,q_80,usm_0.66_1.00_0.01/98e591_4c25f68e03d04271889c8d7fb6f960a1~mv2.png",
    "https://static.wixstatic.com/media/98e591_5847a1a0867a4b58b526cc15a17e23f7~mv2.jpg/v1/fill/w_1100,h_687,al_c,q_85,enc_auto/98e591_5847a1a0867a4b58b526cc15a17e23f7~mv2.jpg",
    "https://static.wixstatic.com/media/98e591_c1e1baa8ccdf47769230b6adfc792be9~mv2.jpeg/v1/fill/w_1100,h_618,al_c,q_85,enc_auto/98e591_c1e1baa8ccdf47769230b6adfc792be9~mv2.jpeg",
    "https://static.wixstatic.com/media/98e591_1c5158e7dd3f4234a320135704e33a83~mv2.png/v1/fill/w_615,h_649,al_c,q_90,enc_auto/98e591_1c5158e7dd3f4234a320135704e33a83~mv2.png",
    "https://static.wixstatic.com/media/98e591_6aa01bcb340040848c4708c138a6168e~mv2.jpg/v1/fill/w_1044,h_800,al_c,q_85,enc_auto/98e591_6aa01bcb340040848c4708c138a6168e~mv2.jpg",
    "https://static.wixstatic.com/media/98e591_44ee91fe802b41b594383d71058085c7~mv2.png/v1/fill/w_618,h_800,al_c,q_90,enc_auto/98e591_44ee91fe802b41b594383d71058085c7~mv2.png",
    "https://static.wixstatic.com/media/98e591_271c1894e78d4aa1b3893e857c0bd37b~mv2.jpg/v1/fill/w_1100,h_618,al_c,q_85,enc_auto/98e591_271c1894e78d4aa1b3893e857c0bd37b~mv2.jpg",
  ];
  images = offset(images, 3);
</script>

<template>
  <section
    v-if="images"
    class="slider overflow-hidden border-(red 10 solid) w-80vw h-sm p-4"
    style="
      mask: linear-gradient(
        90deg,
        transparent,
        white 20%,
        white 80%,
        transparent
      );
    "
  >
    <div n-scroller-inner ref="scrollRef" class="gap-2 flex h-sm w-max">
      <div v-for="image in images" :key="image" class="w-full">
        <!-- <NuxtLink
              :to="`/detail/${image.pathname.split('.')[0]}`"
              @click="active = image.pathname.split('.')[0]"
            > -->
        <img
          v-if="image"
          width="527"
          height="430"
          :src="`${image}`"
          draggable="false"
          class="h-full select-none w-auto rounded-md transition-all duration-200 brightness-[.8] hover:brightness-100 will-change-[filter] object-cover"
        />
        <!-- </NuxtLink> -->
      </div>
    </div>
  </section>
</template>
