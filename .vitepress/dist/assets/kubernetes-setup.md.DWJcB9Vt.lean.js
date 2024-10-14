import{_ as i,c as a,a0 as n,o as t}from"./chunks/framework.BGo0cstt.js";const g=JSON.parse('{"title":"","description":"","frontmatter":{},"headers":[],"relativePath":"kubernetes-setup.md","filePath":"kubernetes-setup.md"}'),e={name:"kubernetes-setup.md"};function l(h,s,p,r,o,k){return t(),a("div",null,s[0]||(s[0]=[n(`<p>Setting up a Kubernetes (K8s) cluster as a beginner can feel daunting, but breaking it down step by step makes it much more manageable. I’ll provide detailed explanations, alternatives, and reasons for each tool and choice. We’ll cover:</p><ol><li><strong>Understanding Kubernetes basics</strong></li><li><strong>Cluster setup with <code>kubeadm</code></strong></li><li><strong>Networking setup</strong></li><li><strong>Storage setup</strong></li><li><strong>Ingress (for exposing apps)</strong></li><li><strong>CI/CD, monitoring, and logging</strong></li><li><strong>Hosting a simple app</strong></li></ol><p>Let’s dive in.</p><hr><h2 id="understanding-kubernetes-basics" tabindex="-1"><strong>Understanding Kubernetes Basics</strong> <a class="header-anchor" href="#understanding-kubernetes-basics" aria-label="Permalink to &quot;**Understanding Kubernetes Basics**&quot;">​</a></h2><p>Kubernetes is a platform that automates the management of containerized applications across a cluster of machines (nodes). There are two main types of nodes:</p><ul><li><p><strong>Control Plane (Master):</strong> Manages the overall cluster (scheduling, scaling, networking, etc.)</p></li><li><p><strong>Worker Nodes:</strong> Run the actual workloads (containers/apps) and are controlled by the Control Plane.</p></li><li><p><strong>Why N1 for Control Plane?</strong><br> We selected <strong>N1</strong> because Kubernetes control plane components (API server, etcd, controller manager) need sufficient memory and CPU for scheduling tasks and maintaining the cluster state. N1’s specs ensure stability.</p></li><li><p><strong>Why N3 for Storage?</strong><br> N3’s additional storage (2TB) is great for hosting Persistent Volume Claims (PVCs), databases, and MiniIO (object storage), making it an ideal worker for storage-heavy services.</p></li></ul><hr><h2 id="setting-up-the-kubernetes-cluster-using-kubeadm" tabindex="-1"><strong>Setting up the Kubernetes Cluster using <code>kubeadm</code></strong> <a class="header-anchor" href="#setting-up-the-kubernetes-cluster-using-kubeadm" aria-label="Permalink to &quot;**Setting up the Kubernetes Cluster using \`kubeadm\`**&quot;">​</a></h2><h4 id="a-prerequisites" tabindex="-1">a. <strong>Prerequisites</strong> <a class="header-anchor" href="#a-prerequisites" aria-label="Permalink to &quot;a. **Prerequisites**&quot;">​</a></h4><ul><li><p><strong>OS</strong>: Use Ubuntu 22.04 LTS or CentOS 8 on all nodes.</p></li><li><p><strong>Basic setup</strong>: Ensure all nodes are on the same private network and can communicate via SSH.</p></li><li><p><strong>Install Docker (Container Runtime)</strong>: Kubernetes uses containers to run workloads, and Docker is a container runtime.</p><ol><li>On each node, run:<div class="language-bash vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">bash</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">sudo</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> apt-get</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> update</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">sudo</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> apt-get</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> install</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> -y</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> docker.io</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">sudo</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> systemctl</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> enable</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> docker</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">sudo</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> systemctl</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> start</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> docker</span></span></code></pre></div></li></ol></li></ul><h2 id="installing-kubernetes-components-kubeadm-kubelet-kubectl" tabindex="-1"><strong>Installing Kubernetes Components (<code>kubeadm</code>, <code>kubelet</code>, <code>kubectl</code>)</strong> <a class="header-anchor" href="#installing-kubernetes-components-kubeadm-kubelet-kubectl" aria-label="Permalink to &quot;**Installing Kubernetes Components (\`kubeadm\`, \`kubelet\`, \`kubectl\`)**&quot;">​</a></h2><ol><li><p><strong>Add Kubernetes repository:</strong> Run these commands on all three nodes (N1, N2, and N3):</p><div class="language-bash vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">bash</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">sudo</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> apt-get</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> update</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">sudo</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> apt-get</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> install</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> -y</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> apt-transport-https</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> ca-certificates</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> curl</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> curl</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> -fsSL</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> https://pkgs.k8s.io/core:/stable:/v1.30/deb/Release.key</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> |</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> sudo</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> gpg</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> --dearmor</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> -o</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> /etc/apt/keyrings/kubernetes-apt-keyring.gpg</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> echo</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;deb [signed-by=/etc/apt/keyrings/kubernetes-apt-keyring.gpg] https://pkgs.k8s.io/core:/stable:/v1.30/deb/ /&#39;</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> |</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> sudo</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> tee</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> /etc/apt/sources.list.d/kubernetes.list</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">   sudo</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> apt-get</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> update</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">sudo</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> apt-get</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> install</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> -y</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> kubelet</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> kubeadm</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> kubectl</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">sudo</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> apt-mark</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> hold</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> kubelet</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> kubeadm</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> kubectl</span></span></code></pre></div><h5 id="command-breakdown-s" tabindex="-1">Command Breakdown(s) <a class="header-anchor" href="#command-breakdown-s" aria-label="Permalink to &quot;Command Breakdown(s)&quot;">​</a></h5><div class="language-bash vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">bash</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">sudo</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> apt-get</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> install</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> -y</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> apt-transport-https</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> ca-certificates</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> curl</span></span></code></pre></div><ul><li><p>This command installs three important packages:</p><ul><li><code>apt-transport-https</code>: Enables apt to communicate with repositories over HTTPS. Kubernetes packages are served via HTTPS, so this is required.</li><li><code>ca-certificates</code>: Contains certificates for trusted Certificate Authorities (CA), ensuring secure connections.</li><li><code>curl</code>: A command-line tool used to transfer data from or to a server. We&#39;ll use it to download the GPG key for the Kubernetes repository.</li></ul></li></ul></li><li><p><strong>What’s what:</strong></p><ul><li><strong>kubeadm</strong>: The tool to bootstrap a Kubernetes cluster.</li><li><strong>kubelet</strong>: The service that runs on all nodes, managing container workloads.</li><li><strong>kubectl</strong>: A command-line tool to interact with the cluster.</li></ul></li></ol><h2 id="initialize-control-plane-on-n1" tabindex="-1"><strong>Initialize Control Plane on N1</strong> <a class="header-anchor" href="#initialize-control-plane-on-n1" aria-label="Permalink to &quot;**Initialize Control Plane on N1**&quot;">​</a></h2><ol><li><p><strong>Initialize the control plane on N1 (master node):</strong></p><div class="language-bash vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">bash</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">sudo</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> kubeadm</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> init</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> --pod-network-cidr=192.168.0.0/16</span></span></code></pre></div><ul><li><strong>Why <code>pod-network-cidr</code>?</strong> This specifies the IP address range for pods (containers) running in the cluster. Different networking plugins require this (more on this below).</li></ul><p><strong>After a successful initialization:</strong> 2. <strong>Set up <code>kubectl</code> for local user:</strong></p><div class="language-bash vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">bash</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">mkdir</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> -p</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> $HOME</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">/.kube</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">sudo</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> cp</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> -i</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> /etc/kubernetes/admin.conf</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> $HOME</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">/.kube/config</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">sudo</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> chown</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> $(</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">id</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> -u</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">:</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">$(</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">id</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> -g</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) $HOME</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">/.kube/config</span></span></code></pre></div><p><strong>What’s happening?</strong><br> This configures <code>kubectl</code> (the Kubernetes command-line tool) to communicate with your new cluster from N1.</p></li></ol><h4 id="join-n2-and-n3-as-worker-nodes" tabindex="-1"><strong>Join N2 and N3 as Worker Nodes</strong> <a class="header-anchor" href="#join-n2-and-n3-as-worker-nodes" aria-label="Permalink to &quot;**Join N2 and N3 as Worker Nodes**&quot;">​</a></h4><ol><li><p><strong>Generate a join command on N1:</strong></p><div class="language-bash vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">bash</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">kubeadm</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> token</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> create</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> --print-join-command</span></span></code></pre></div><ul><li>This will give you a command like:<div class="language-bash vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">bash</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">kubeadm</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> join</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> &lt;</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">MASTER_I</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">P</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">&gt;</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">:6443</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> --token</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> &lt;</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">toke</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">n</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">&gt;</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> --discovery-token-ca-cert-hash</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> sha256:</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">&lt;</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">has</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">h</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">&gt;</span></span></code></pre></div></li></ul></li><li><p><strong>Run this command on N2 and N3 to join them to the cluster</strong>:</p><div class="language-bash vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">bash</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">sudo</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> kubeadm</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> join</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> &lt;</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">MASTER_I</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">P</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">&gt;</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">:6443</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> --token</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> &lt;</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">toke</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">n</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">&gt;</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> --discovery-token-ca-cert-hash</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> sha256:</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">&lt;</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">has</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">h</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">&gt;</span></span></code></pre></div></li></ol><hr><h3 id="networking-setup-pod-communication" tabindex="-1"><strong>Networking Setup (Pod Communication)</strong> <a class="header-anchor" href="#networking-setup-pod-communication" aria-label="Permalink to &quot;**Networking Setup (Pod Communication)**&quot;">​</a></h3><h4 id="choose-a-networking-plugin-cni" tabindex="-1"><strong>Choose a Networking Plugin (CNI)</strong> <a class="header-anchor" href="#choose-a-networking-plugin-cni" aria-label="Permalink to &quot;**Choose a Networking Plugin (CNI)**&quot;">​</a></h4><p>Kubernetes needs a Container Networking Interface (CNI) plugin to allow pods to communicate with each other across nodes.</p><ul><li><strong>Why Calico?</strong><ul><li><strong>Calico</strong> is a robust, scalable, and feature-rich CNI plugin.</li><li><strong>Alternatives</strong>: <ul><li><strong>Flannel</strong>: Simpler but lacks security features.</li><li><strong>Weave</strong>: Good for small clusters but not as scalable as Calico.</li></ul></li><li><strong>Best Choice</strong>: Calico for production-grade clusters.</li></ul></li></ul><h4 id="install-calico-on-n1" tabindex="-1">Install Calico on N1: <a class="header-anchor" href="#install-calico-on-n1" aria-label="Permalink to &quot;Install Calico on N1:&quot;">​</a></h4><div class="language-bash vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">bash</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">kubectl</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> apply</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> -f</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> https://docs.projectcalico.org/manifests/calico.yaml</span></span></code></pre></div><p>This deploys Calico networking across all nodes.</p><hr><h2 id="storage-setup" tabindex="-1"><strong>Storage Setup</strong> <a class="header-anchor" href="#storage-setup" aria-label="Permalink to &quot;**Storage Setup**&quot;">​</a></h2><p>For persistent data (databases, files, etc.), Kubernetes uses <strong>Persistent Volumes (PV)</strong> and <strong>Persistent Volume Claims (PVC)</strong>. These can be backed by different storage solutions:</p><ul><li><strong>Why NFS and MiniIO?</strong><ul><li><strong>NFS (Network File System)</strong> is easy to set up and can share storage across nodes.</li><li><strong>MiniIO</strong> provides object storage, similar to Amazon S3, but self-hosted.</li><li><strong>Alternatives</strong>: <ul><li><strong>Ceph</strong>: Good for distributed storage but complex to set up.</li><li><strong>Longhorn</strong>: Simplifies management, but MiniIO offers better object storage flexibility.</li></ul></li></ul></li></ul><h4 id="set-up-nfs-on-n3" tabindex="-1"><strong>Set up NFS (on N3)</strong> <a class="header-anchor" href="#set-up-nfs-on-n3" aria-label="Permalink to &quot;**Set up NFS (on N3)**&quot;">​</a></h4><ol><li><p><strong>Install NFS server</strong>:</p><div class="language-bash vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">bash</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">sudo</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> apt-get</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> install</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> nfs-kernel-server</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">sudo</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> mkdir</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> -p</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> /srv/nfs/kubedata</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">sudo</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> chown</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> nobody:nogroup</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> /srv/nfs/kubedata</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">sudo</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> chmod</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> 777</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> /srv/nfs/kubedata</span></span></code></pre></div></li><li><p><strong>Configure export rule (NFS server)</strong>:</p><div class="language-bash vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">bash</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">sudo</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> nano</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> /etc/exports</span></span></code></pre></div><p>Add:</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>/srv/nfs/kubedata &lt;worker_nodes_IP&gt;(rw,sync,no_subtree_check)</span></span></code></pre></div></li><li><p><strong>Start NFS</strong>:</p><div class="language-bash vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">bash</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">sudo</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> exportfs</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> -a</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">sudo</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> systemctl</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> restart</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> nfs-kernel-server</span></span></code></pre></div></li></ol><h4 id="set-up-miniio-on-n3" tabindex="-1"><strong>Set up MiniIO (on N3)</strong> <a class="header-anchor" href="#set-up-miniio-on-n3" aria-label="Permalink to &quot;**Set up MiniIO (on N3)**&quot;">​</a></h4><ol><li><strong>Install MiniIO</strong>:<div class="language-bash vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">bash</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">wget</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> https://dl.min.io/server/minio/release/linux-amd64/minio</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">chmod</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> +x</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> minio</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">./minio</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> server</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> /mnt/data</span></span></code></pre></div><ul><li>Access via browser: <code>http://&lt;N3_IP&gt;:9000</code></li></ul></li></ol><hr><h2 id="ingress-controller-for-exposing-apps" tabindex="-1"><strong>Ingress Controller (For Exposing Apps)</strong> <a class="header-anchor" href="#ingress-controller-for-exposing-apps" aria-label="Permalink to &quot;**Ingress Controller (For Exposing Apps)**&quot;">​</a></h2><p>Kubernetes does not expose services to the internet by default. To expose apps, you need an <strong>Ingress Controller</strong>.</p><ul><li><strong>Why Nginx Ingress?</strong><ul><li>Nginx is the most popular and well-supported ingress controller.</li><li><strong>Alternatives</strong>: <ul><li><strong>Traefik</strong>: Easier setup, but Nginx has more features and community support.</li></ul></li><li><strong>Best Choice</strong>: Nginx for robust ingress routing.</li></ul></li></ul><h4 id="install-nginx-ingress" tabindex="-1">Install Nginx Ingress: <a class="header-anchor" href="#install-nginx-ingress" aria-label="Permalink to &quot;Install Nginx Ingress:&quot;">​</a></h4><div class="language-bash vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">bash</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">kubectl</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> apply</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> -f</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> https://raw.githubusercontent.com/kubernetes/ingress-nginx/main/deploy/static/provider/cloud/deploy.yaml</span></span></code></pre></div><hr><h2 id="ci-cd-tools-setup" tabindex="-1"><strong>CI/CD Tools Setup</strong> <a class="header-anchor" href="#ci-cd-tools-setup" aria-label="Permalink to &quot;**CI/CD Tools Setup**&quot;">​</a></h2><ul><li><strong>Why Jenkins?</strong><ul><li>Jenkins is widely used, with vast plugin support.</li><li><strong>Alternatives</strong>: <ul><li><strong>GitLab CI</strong>: Integrated Git and CI/CD, but more complex to self-host.</li><li><strong>ArgoCD</strong>: GitOps-based, simpler than Jenkins, but limited flexibility.</li></ul></li><li><strong>Best Choice</strong>: Jenkins for broader support and more flexibility.</li></ul></li></ul><h4 id="install-jenkins-with-helm" tabindex="-1">Install Jenkins with Helm: <a class="header-anchor" href="#install-jenkins-with-helm" aria-label="Permalink to &quot;Install Jenkins with Helm:&quot;">​</a></h4><div class="language-bash vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">bash</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">helm</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> repo</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> add</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> jenkinsci</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> https://charts.jenkins.io</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">helm</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> install</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> jenkins</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> jenkinsci/jenkins</span></span></code></pre></div><hr><h2 id="monitoring-and-logging" tabindex="-1"><strong>Monitoring and Logging</strong> <a class="header-anchor" href="#monitoring-and-logging" aria-label="Permalink to &quot;**Monitoring and Logging**&quot;">​</a></h2><ul><li><strong>Why Prometheus and Grafana?</strong><ul><li><strong>Prometheus</strong>: Best tool for time-series monitoring.</li><li><strong>Grafana</strong>: Ideal for visualizing metrics.</li><li><strong>Alternatives</strong>: <ul><li><strong>ELK stack</strong>: Good for logs, but Prometheus + Grafana offer better observability.</li></ul></li><li><strong>Best Choice</strong>: Prometheus and Grafana for easy integration.</li></ul></li></ul><h4 id="install-prometheus-and-grafana" tabindex="-1">Install Prometheus and Grafana: <a class="header-anchor" href="#install-prometheus-and-grafana" aria-label="Permalink to &quot;Install Prometheus and Grafana:&quot;">​</a></h4><div class="language-bash vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">bash</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">helm</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> install</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> prometheus</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> prometheus-community/prometheus</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">helm</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> install</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> grafana</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> grafana/grafana</span></span></code></pre></div><hr><h2 id="deploying-a-simple-app-and-exposing-it" tabindex="-1"><strong>Deploying a Simple App and Exposing it</strong> <a class="header-anchor" href="#deploying-a-simple-app-and-exposing-it" aria-label="Permalink to &quot;**Deploying a Simple App and Exposing it**&quot;">​</a></h2><h4 id="deploy-an-nginx-app" tabindex="-1">Deploy an Nginx App: <a class="header-anchor" href="#deploy-an-nginx-app" aria-label="Permalink to &quot;Deploy an Nginx App:&quot;">​</a></h4><div class="language-bash vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">bash</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">kubectl</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> create</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> deployment</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> nginx</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> --image=nginx</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">kubectl</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> expose</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> deployment</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> nginx</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> --port=80</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> --type=NodePort</span></span></code></pre></div><h2 id="set-up-ingress-for-your-app" tabindex="-1">Set Up Ingress for Your App: <a class="header-anchor" href="#set-up-ingress-for-your-app" aria-label="Permalink to &quot;Set Up Ingress for Your App:&quot;">​</a></h2><div class="language-yaml vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">yaml</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"></span>
<span class="line"></span>
<span class="line"></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">apiVersion</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">networking.k8s.io/v1</span></span>
<span class="line"><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">kind</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">Ingress</span></span>
<span class="line"><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">metadata</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">:</span></span>
<span class="line"><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">  name</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">nginx-ingress</span></span>
<span class="line"><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">  annotations</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">:</span></span>
<span class="line"><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">    nginx.ingress.kubernetes.io/rewrite-target</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">/</span></span>
<span class="line"><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">spec</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">:</span></span>
<span class="line"><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">  rules</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">:</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  - </span><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">host</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">myapp.sardul3.com</span></span>
<span class="line"><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">    http</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">:</span></span>
<span class="line"><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">      paths</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">:</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">      - </span><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">path</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">/</span></span>
<span class="line"><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">        pathType</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">Prefix</span></span>
<span class="line"><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">        backend</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">:</span></span>
<span class="line"><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">          service</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">:</span></span>
<span class="line"><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">            name</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">nginx</span></span>
<span class="line"><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">            port</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">:</span></span>
<span class="line"><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">              number</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">80</span></span></code></pre></div><hr><h2 id="summary-and-tips" tabindex="-1">Summary and Tips: <a class="header-anchor" href="#summary-and-tips" aria-label="Permalink to &quot;Summary and Tips:&quot;">​</a></h2><ul><li><p><strong>Cluster Design Tips:</strong></p><ul><li>Always keep the control plane on a dedicated node.</li><li>For persistent storage, choose the node with the most storage capacity.</li><li>Start small with tools like Jenkins and Prometheus, and scale as needed.</li></ul></li><li><p><strong>Gotchas to Watch For:</strong></p><ul><li><strong>Networking Issues:</strong> Ensure all nodes can communicate with each other.</li><li><strong>Resources:</strong> Kubernetes is resource-hungry, monitor your node resources using Prometheus.</li></ul></li><li><p><strong>Best Practices:</strong></p><ul><li>Use Helm to manage application deployments.</li><li>Secure your cluster with tools like Falco (for intrusion detection).</li><li>Enable RBAC (Role-Based Access Control) for secure access management.</li></ul></li></ul><p>By following these steps and explanations, you’ll have a production-grade, yet simple, Kubernetes cluster that is flexible and scalable!</p>`,59)]))}const c=i(e,[["render",l]]);export{g as __pageData,c as default};
