# Adds the Tidelight widget to the iOS project as its own target, once. It was run on November
# 15, 2026; it is kept so the change to the Xcode project can be read and repeated, and it does
# nothing if the target is already there.
#
#   GEM_HOME=<CocoaPods' own gems> ruby tools/add-widget-target.rb     (from app/)
#
# It uses the `xcodeproj` library that CocoaPods brings, so the project file is never edited by
# hand. It sets no team and no signing identity: those stay a founder's to choose in Xcode.
require 'xcodeproj'

path = File.join(__dir__, '..', 'ios', 'App', 'App.xcodeproj')
project = Xcodeproj::Project.open(path)
name = 'TidelightWidget'
if project.targets.any? { |t| t.name == name }
  puts "#{name} is already in the project. Nothing changed."
  exit 0
end

app = project.targets.find { |t| t.name == 'App' } or abort('The App target is missing.')
app_settings = app.build_configurations.first.build_settings

widget = project.new_target(:app_extension, name, :ios, '17.0', nil, :swift)
group = project.main_group.new_group(name, name)
widget.add_file_references([group.new_file('TidelightWidget.swift')])
group.new_file('Info.plist')
strings = group.new_variant_group('Localizable.strings')
%w[en es].each do |lang|
  ref = strings.new_file("#{lang}.lproj/Localizable.strings")
  ref.name = lang
end
widget.resources_build_phase.add_file_reference(strings)

widget.build_configurations.each do |config|
  s = config.build_settings
  s['PRODUCT_BUNDLE_IDENTIFIER'] = "#{app_settings['PRODUCT_BUNDLE_IDENTIFIER']}.widget"
  s['PRODUCT_NAME'] = '$(TARGET_NAME)'
  s['INFOPLIST_FILE'] = "#{name}/Info.plist"
  s['GENERATE_INFOPLIST_FILE'] = 'NO'
  s['SWIFT_VERSION'] = '5.0'
  s['IPHONEOS_DEPLOYMENT_TARGET'] = '17.0'
  s['TARGETED_DEVICE_FAMILY'] = app_settings['TARGETED_DEVICE_FAMILY'] || '1,2'
  s['MARKETING_VERSION'] = app_settings['MARKETING_VERSION'] || '1.0'
  s['CURRENT_PROJECT_VERSION'] = app_settings['CURRENT_PROJECT_VERSION'] || '1'
  s['CODE_SIGN_STYLE'] = 'Automatic'
  s['SKIP_INSTALL'] = 'YES'
  s['LD_RUNPATH_SEARCH_PATHS'] = ['$(inherited)', '@executable_path/Frameworks', '@executable_path/../../Frameworks']
  s['SWIFT_EMIT_LOC_STRINGS'] = 'YES'
end

# The app carries the widget inside it.
app.add_dependency(widget)
embed = app.new_copy_files_build_phase('Embed Foundation Extensions')
embed.symbol_dst_subfolder_spec = :plug_ins
build_file = embed.add_file_reference(widget.product_reference)
build_file.settings = { 'ATTRIBUTES' => ['RemoveHeadersOnCopy'] }

# The widget's words exist in Spanish too.
regions = project.root_object.known_regions
project.root_object.known_regions = (regions + ['es']).uniq

project.save
puts "Added #{name} (#{widget.build_configurations.first.build_settings['PRODUCT_BUNDLE_IDENTIFIER']}) to the project."
