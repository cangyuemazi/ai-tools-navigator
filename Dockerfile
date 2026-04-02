# ====== 阶段一：构建 ======
FROM node:20-alpine AS builder
WORKDIR /app

# 设置淘宝镜像源
RUN npm config set registry https://registry.npmmirror.com/
RUN npm install -g pnpm
RUN pnpm config set registry https://registry.npmmirror.com/

COPY package.json pnpm-lock.yaml ./
COPY patches ./patches
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm build

# ====== 阶段二：运行 ======
FROM node:20-alpine
WORKDIR /app

# 👇 修改：在这里全局安装 prisma，方便稍后直接生成客户端
RUN npm config set registry https://registry.npmmirror.com/
RUN npm install -g pnpm tsx prisma
RUN pnpm config set registry https://registry.npmmirror.com/

COPY package.json pnpm-lock.yaml ./
COPY patches ./patches
RUN pnpm install --frozen-lockfile --prod

COPY --from=builder /app/dist ./dist
# (删除了那行会报错的 COPY node_modules/.prisma)
COPY server ./server
COPY shared ./shared
COPY prisma ./prisma

# 👇 新增：在当前环境直接生成 Prisma 客户端，避开软链接问题
RUN prisma generate

# 将前端产物放入后端静态目录，并创建上传文件夹
RUN mkdir -p server/public && cp -r dist/* server/public/
RUN mkdir -p client/public/uploads

EXPOSE 3001
ENV NODE_ENV=production
CMD ["tsx", "server/index.ts"]