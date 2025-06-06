<template>
    <div v-if="visible" class="confirm-dialog-overlay" @click.self="cancel">
        <div class="confirm-dialog">
            <div class="confirm-dialog-header">
                <h3>确认操作</h3>
            </div>
            <div class="confirm-dialog-body">
                <p>{{ message }}</p>
                <slot name="extra"></slot>
            </div>
            <div class="confirm-dialog-footer">
                <button class="confirm-button" @click="confirm">确认</button>
                <button class="cancel-button" @click="cancel">取消</button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, watch, defineProps, defineEmits } from 'vue';

const props = defineProps({
    visible: {
        type: Boolean,
        default: false,
    },
    message: {
        type: String,
        required: true,
    },
});

const emit = defineEmits(['confirm', 'cancel', 'update:visible']);

const confirm = () => {
    emit('confirm');
    emit('update:visible', false);
};

const cancel = () => {
    emit('cancel');
    emit('update:visible', false);
};
</script>

<style scoped>
.confirm-dialog-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
}

.confirm-dialog {
    background: white;
    padding: 20px;
    border-radius: 8px;
    width: 400px;
    max-width: 90%;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.confirm-dialog-header h3 {
    margin-top: 0;
    color: #42b983;
    border-bottom: 1px solid #eee;
    padding-bottom: 10px;
    font-size: 18px;
}

.confirm-dialog-body {
    padding: 15px 0;
}

.confirm-dialog-body p {
    margin: 0;
    color: #606266;
    line-height: 1.5;
}

.confirm-dialog-footer {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    margin-top: 20px;
}

.confirm-button,
.cancel-button {
    padding: 8px 16px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.2s;
    font-size: 14px;
}

.confirm-button {
    background: #42b983;
    color: white;
}

.confirm-button:hover {
    background: #3aa373;
}

.cancel-button {
    background: #f0f0f0;
    color: #606266;
}

.cancel-button:hover {
    background: #e0e0e0;
}

/* 额外内容的样式 */
.delete-checkbox {
    display: flex;
    align-items: center;
    margin-top: 15px;
    color: #606266;
    font-size: 14px;
    cursor: pointer;
}

.delete-checkbox input {
    margin-right: 8px;
    cursor: pointer;
}
</style>