#
# Cookbook Name:: hamepic
# Recipe:: default
#
# Copyright 2015, Hametuha INC.
#
# License MIT
#

#
# Install Gcc
# -----------------------
%w[
  chrony
  gcc
  gcc-c++
  git
  openssl-devel
  freetype-devel
  fontconfig-devel
  qt-devel
  freetype-devel
  fontconfig-devel
  ipa-gothic-fonts
  ipa-mincho-fonts
].each do |pkg|
  yum_package pkg do
    action :install
  end
end


#
# Install Node
# -----------------------
# Create Log directory
directory "node_log_dir" do
  owner "vagrant"
  group "vagrant"
  mode "777"
  path File.join(node[:log_dir], "node")
  action :create
end
# npms
['gulp', 'bower', 'node-gyp'].each do |npm|
  nodejs_npm npm
end


#
#
# Create virtual hosts setting
# --------------------------
#
# Create cache directory
directory "nginx_cache" do
  owner "vagrant"
  group "vagrant"
  mode "777"
  path node[:cache_dir]
  action :create
end
# Create Log directory
directory "nginx_log" do
  owner "vagrant"
  group "vagrant"
  mode "777"
  path node['nginx']['log_dir']
  action :create
end
# Put configuration file
["static.conf"].each do |conf|
  cookbook_file conf do
    path File.join('/etc/nginx', conf)
    mode '0644'
    owner 'root'
    group 'root'
    backup false
    action :create
  end
end
# Install SSL certificate
bash "create_self_signed_cerficiate" do
  cwd '/etc/pki/tls'
  code <<-EOH
    openssl req -new -newkey rsa:2048 -sha1 -x509 -nodes \
      -set_serial 0 \
      -days 365 \
      -subj "/C=JP/CN=#{node['host_name']}" \
      -out "certs/localhost.crt" \
      -keyout "private/localhost.key" &&
    cat "certs/localhost.crt" "private/localhost.key" >> "private/localhost.crt_and_key" &&
    chmod 400 "private/localhost.key" "private/localhost.crt_and_key"
  EOH
  creates 'private/localhost.crt_and_key'
  action :run
end
# Install nginx config
template "/etc/nginx/sites-enabled/nginx.vagrant.conf" do
  source "nginx.vagrant.conf.erb"
  mode '0644'
  backup false
  owner 'root'
  group 'root'
  action :create
  notifies :restart, "service[nginx]"
end


# install Genghis
gem_package 'genghisapp'

#
#
# Setup postfix
# --------------------------
#
# regex
cookbook_file 'aliases.regexp' do
  path '/etc/aliases.regexp'
  mode '0644'
  owner 'root'
  group 'root'
  action :create
end
# map file
cookbook_file 'transport_map' do
  path '/etc/postfix/transport_map'
  mode '0644'
  owner 'root'
  group 'root'
  action :create
end
# main.cf
cookbook_file 'main.cf' do
  path '/etc/postfix/main.cf'
  mode '0644'
  owner 'root'
  group 'root'
  action :create
end
# Install mailx
yum_package 'mailx' do
  action :install
end


#
#
# Almost O.K.
# --------------------------
#

