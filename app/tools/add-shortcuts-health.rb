# Adds the Shortcuts and Apple Health files to the iOS app target, once. It was run on November
# 15, 2026; it is kept so the change to the Xcode project can be read and repeated, and it does
# nothing for a file that is already there.
#
#   GEM_HOME=<CocoaPods' own gems> ruby tools/add-shortcuts-health.rb     (from app/)
#
# It uses the `xcodeproj` library that CocoaPods brings, so the project file is never edited by
# hand. It sets no team and no signing identity: those stay a founder's to choose in Xcode. It does
# point the app at App.entitlements, which holds one entitlement (Apple Health); a signed build for
# a real phone needs a profile that allows it, which is also a founder's to set up.
require 'xcodeproj'

path = File.join(__dir__, '..', 'ios', 'App', 'App.xcodeproj')
project = Xcodeproj::Project.open(path)
app = project.targets.find { |t| t.name == 'App' } or abort('The App target is missing.')
group = project.main_group['App'] or abort('The App group is missing.')
changed = []

# Swift sources.
%w[TidelightShortcuts.swift TidelightHealth.swift].each do |file|
  next if group.files.any? { |f| f.path == file }
  app.add_file_references([group.new_file(file)])
  changed << file
end

# Words in English and Spanish: the shortcuts' names, and what a person can say to Siri.
%w[Localizable.strings AppShortcuts.strings].each do |file|
  next if group.children.any? { |c| c.display_name == file }
  strings = group.new_variant_group(file)
  %w[en es].each do |lang|
    ref = strings.new_file("#{lang}.lproj/#{file}")
    ref.name = lang
  end
  app.resources_build_phase.add_file_reference(strings)
  changed << file
end

# The one entitlement: Apple Health.
unless group.files.any? { |f| f.path == 'App.entitlements' }
  group.new_file('App.entitlements')
  changed << 'App.entitlements'
end
app.build_configurations.each do |config|
  next if config.build_settings['CODE_SIGN_ENTITLEMENTS'] == 'App/App.entitlements'
  config.build_settings['CODE_SIGN_ENTITLEMENTS'] = 'App/App.entitlements'
  changed << "entitlements setting (#{config.name})"
end

regions = project.root_object.known_regions
project.root_object.known_regions = (regions + ['es']).uniq

if changed.empty?
  puts 'Everything is already in the project. Nothing changed.'
else
  project.save
  puts "Added to the App target: #{changed.join(', ')}."
end
