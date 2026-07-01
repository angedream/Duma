<template>
  <div class="login-container">
    <!-- 标题 -->
    <div class="login-title">密码登录</div>

    <!-- 登录表单 -->
    <van-form @submit="onSubmit">
      <!-- 账号输入 -->
      <van-field
        v-model="formData.account"
        name="account"
        placeholder="请输入手机号/邮箱"
        :rules="phoneRules"
      >
        <template #left-icon>
          <span class="country-code">+86</span>
        </template>
      </van-field>

      <!-- 密码输入 -->
      <van-field
        v-model="formData.password"
        type="password"
        name="password"
        placeholder="请输入密码"
        :rules="[{ required: true, message: '请输入密码' }]"
      />

      <!-- 协议勾选 -->
      <div class="agreement-wrapper">
        <van-checkbox v-model="formData.agreed" shape="round">
          <span class="agreement-text">
            我已阅读并同意签署
            <span class="link" @click.stop="goToAgreement('user')">《用户协议》</span>
            <span class="link" @click.stop="goToAgreement('privacy')">《隐私政策》</span>
          </span>
        </van-checkbox>
      </div>

      <!-- 登录按钮 -->
      <div class="login-btn-wrapper">
        <van-button
          round
          block
          type="primary"
          native-type="submit"
          :disabled="!formData.agreed"
        >
          登录/注册
        </van-button>
      </div>

      <!-- 验证码登录切换 -->
      <div class="switch-login" @click="switchToCodeLogin">
        验证码登录
      </div>
    </van-form>
  </div>
</template>

<script setup lang="ts">
import { reactive, onMounted } from 'vue'
import { showToast } from 'vant'
import 'vant/es/toast/style'
import { getUserData, setUserData } from '@/api/storge'
import { useRouter } from 'vue-router'
import { generateUUID } from '@/utils/uuid'
import { useMQTTStore } from '@/store/mqtt';
const mqtt = useMQTTStore()
const router = useRouter()
// 表单数据
const formData = reactive({
  account: '',
  password: '',
  agreed: false,
  dumaId:''
})
onMounted(() => {
  console.log();
  if (getUserData()) {
    router.push('/home');

  } else {
    formData.dumaId =generateUUID();
  }


})
// 手机号校验规则
const phoneRules = [
  { required: true, message: '请输入手机号' },
  { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号格式' }
];
// 提交登录
const onSubmit = (values: any) => {
  if (!formData.agreed) {
    showToast('请先阅读并同意用户协议和隐私政策')
    return
  }

  console.log('登录提交:', values)
  setUserData(JSON.stringify(formData));
  let ddd = {
    ...formData
  }
  mqtt.duma = { dumaId: '1212' };
  mqtt.connect();
  router.push('/home');
  // 在这里调用登录 API
}

// 跳转协议页面
const goToAgreement = (type:any) => {
  console.log(`跳转到${type === 'user' ? '用户协议' : '隐私政策'}页面`)
  // 使用路由跳转
  // router.push(`/agreement/${type}`)
}

// 切换到验证码登录
const switchToCodeLogin = () => {
  showToast('切换到微信登录')
  // router.push('/login/code')
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  padding: 40px 30px 0;
  background-color: #fff;
}

.login-title {
  font-size: 28px;
  font-weight: 600;
  color: #323233;
  margin-bottom: 40px;
}

/* 自定义字段样式 */
:deep(.van-field) {
  padding: 16px 0;
  border-bottom: 1px solid #f0f0f0;
}

:deep(.van-field__body) {
  align-items: center;
}

.country-code {
  font-size: 15px;
  color: #323233;
  font-weight: 500;
  margin-right: 8px;
  padding-right: 8px;
  border-right: 1px solid #e5e5e5;
}

:deep(.van-field__control) {
  font-size: 15px;
  padding-left: 12px;
}

:deep(.van-field__control::placeholder) {
  color: #c8c9cc;
}

/* 协议区域 */
.agreement-wrapper {
  margin: 20px 0 30px;
}

:deep(.van-checkbox) {
  align-items: flex-start;
}

:deep(.van-checkbox__label) {
  font-size: 13px;
  color: #969799;
  line-height: 1.5;
}

.agreement-text {
  display: inline;
}

.link {
  color: #1989fa;
  cursor: pointer;
}

.link:not(:last-child) {
  margin-right: 2px;
}

/* 登录按钮 */
.login-btn-wrapper {
  margin-top: 10px;
}

:deep(.van-button--primary) {
  background: linear-gradient(135deg, #1989fa, #07c160);
  border: none;
  height: 48px;
  font-size: 17px;
  font-weight: 500;
}

:deep(.van-button--primary:disabled) {
  background: #c8c9cc;
  opacity: 0.6;
}

/* 验证码登录切换 */
.switch-login {
  text-align: center;
  margin-top: 20px;
  font-size: 14px;
  color: #969799;
  cursor: pointer;
  padding: 10px 0;
}

.switch-login:active {
  color: #1989fa;
}
</style>
