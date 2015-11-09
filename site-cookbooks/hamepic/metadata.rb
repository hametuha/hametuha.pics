name             'hamepic'
maintainer       'Hametuha INC.'
maintainer_email 'takahashi.fumiki@hametuha.co.jp'
license          'MIT'
description      'Installs/Configures hamepic'
long_description IO.read(File.join(File.dirname(__FILE__), 'README.md'))
version          '0.1.0'

depends 'yum-epel'
depends 'yum-remi'
depends 'selinux'
depends 'nginx'
