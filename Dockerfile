# 使用 Node.js 的官方镜像作为构建环境
FROM node:18 AS build

# 设置工作目录
WORKDIR /app

# 复制 package.json 和 package-lock.json
COPY package*.json ./

# 安装依赖
RUN npm install

# 复制项目文件到容器
COPY . .

# 运行构建命令
RUN npm run build

# 使用轻量级的 nginx 镜像作为生产环境
FROM nginx:alpine

# 复制自定义 Nginx 配置文件到容器
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 复制构建后的文件到 nginx 容器中
COPY --from=build /app/dist /usr/share/nginx/html

# 暴露端口
EXPOSE 80

# 启动 nginx
CMD ["nginx", "-g", "daemon off;"]